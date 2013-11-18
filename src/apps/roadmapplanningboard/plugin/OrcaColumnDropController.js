(function () {
    var Ext = window.Ext4 || window.Ext;

    Ext.define('Rally.apps.roadmapplanningboard.plugin.OrcaColumnDropController', {
        extend: 'Rally.ui.cardboard.plugin.ColumnDropController',
        alias: 'plugin.orcacolumndropcontroller',

        init: function (column) {
            this.callParent(arguments);
            this.cmp = column;
        },

        _addDropTarget: function () {
            var column = this.cmp;
            this.dropTarget = Ext.create('Rally.apps.roadmapplanningboard.OrcaColumnDropTarget', this.getDndContainer(), {
                ddGroup: column.ddGroup,
                column: column
            });
            return this.dropTarget;
        },

        canDragDropCard: function (card) {
            return true;
        },

        onCardDropped: function (dragData, index) {
            var relativeRank, relativeRecord, type;

            var card = dragData.card;
            var record = card.getRecord();
            var sourceColumn = dragData.column;
            var sourceIndex = sourceColumn.findCardInfo(record).index;
            var params = {};
            var column = this.cmp;
            var records = column.getRecords();
            var backlogColumn = (!sourceColumn.planRecord && !column.planRecord);

            // Do default action if this is a backlog column
            if (backlogColumn) {
                this.callParent(arguments);
                return;
            }

            if (column.mayRank() && isNaN(index)) {
                index = records.length;
            }
            if (records.length && column.mayRank() && (sourceColumn === column || column.enableCrossColumnRanking)) {
                if (index === 0) {
                    relativeRecord = records[index];
                    relativeRank = 'rankAbove';
                } else {
                    relativeRecord = records[index - 1];
                    relativeRank = 'rankBelow';
                }

                params[relativeRank] = Rally.util.Ref.getRelativeUri(relativeRecord.getUri());
            }
            this._addDroppedCard(sourceColumn, card, relativeRecord, relativeRank);
            type = sourceColumn === column ? "reorder" : "move";

            var options = {
                card: card,
                params: params,
                record: record,
                sourceColumn: sourceColumn,
                sourceIndex: sourceIndex,
                column: column,
                records: column.getRecords(),
                relativeRank: relativeRank,
                relativeRecord: relativeRecord
            };
            if (column.fireEvent("beforecarddroppedsave", column, card, type) !== false) {
                if (!sourceColumn.planRecord) {
                    return this._moveOutOfBacklog(options);
                } else if (!column.planRecord) {
                    return this._moveIntoBacklog(options);
                } else {
                    return this._moveFromColumnToColumn(options);
                }
            }
        },

        _moveIntoBacklog: function (options) {

            var planRecord = options.sourceColumn.planRecord;

            planRecord.set('features', _.filter(planRecord.get('features'), function (feature) {
                return feature.id !== '' + options.record.getId();
            }));

            // Remove card from plan column
            planRecord.save({
                requester: options.column,
                scope: this
            });

            // Rank card on backlog column
            if (options.column.fireEvent('beforecarddroppedsave', options.column, options.card)) {
                options.record.save({
                    requester: options.column,
                    callback: function (updatedRecord, operation) {
                        if (operation.success) {
                            return this._onDropSaveSuccess(options.column, options.sourceColumn, options.card, options.record, "move");
                        } else {
                            return this._onDropSaveFailure(options.column, options.sourceColumn, options.record, options.card, options.sourceIndex, response);
                        }
                    },
                    scope: this,
                    params: options.params
                });
            }
        },

        _moveOutOfBacklog: function (options) {

            var planRecord = options.column.planRecord;

            planRecord.set('features', planRecord.get('features').concat({
                id: options.record.getId().toString(),
                ref: options.record.getUri()
            }));

            planRecord.save({
                success: function () {
                    return this._onDropSaveSuccess(options.column, null, options.card, options.record, "move");
                },
                failure: function (response, opts) {
                    return this._onDropSaveFailure(options.column, options.sourceColumn, options.record, options.card, options.sourceIndex, response);
                },
                requester: options.column,
                scope: this,
                params: options.params
            });
        },

        _moveFromColumnToColumn: function (options) {

            var srcPlanRecord = options.sourceColumn.planRecord;
            var destPlanRecord = options.column.planRecord;

            srcPlanRecord.set('features', _.filter(srcPlanRecord.get('features'), function (feature) {
                return feature.id !== '' + options.record.getId();
            }));
            destPlanRecord.get('features').push({
                id: options.record.getId().toString(),
                ref: options.record.getUri()
            });

            return Ext.Ajax.request({
                method: 'POST',
                withCredentials: true,
                url: this._constructUrl(srcPlanRecord.get('roadmap'), srcPlanRecord.getId(), destPlanRecord.getId()),
                jsonData: {
                    id: options.record.getId() + '',
                    ref: options.record.getUri()
                },
                success: function () {
                    var type;

                    type = options.sourceColumn === options.column ? "reorder" : "move";
                    srcPlanRecord.dirty = false; // Make sure the record is clean
                    return this._onDropSaveSuccess(options.column, options.sourceColumn, options.card, options.record, type);
                },
                failure: function (response, opts) {
                    return this._onDropSaveFailure(options.column, options.sourceColumn, options.record, options.card, options.sourceIndex, response);
                },
                scope: this,
                params: options.params
            });
        },

        _constructUrl: function (roadmap, sourceId, destinationId) {
            return Ext.create('Ext.XTemplate', Rally.environment.getContext().context.services.planning_service_url + '/roadmap/{roadmap.id}/plan/{sourceId}/features/to/{destinationId}').apply({
                sourceId: sourceId,
                destinationId: destinationId,
                roadmap: roadmap
            });
        },

        _onDropSaveSuccess: function (column, sourceColumn, card, updatedRecord, type) {
            if (column) {
                return column.fireEvent('aftercarddroppedsave', this, card, type);
            }
        },

        _onDropSaveFailure: function (column, sourceColumn, record, card, sourceIndex, errorSource) {
            if (errorSource.error && errorSource.error.errors && errorSource.error.errors.length) {
                Rally.ui.notify.Notifier.showError({
                    message: errorSource.error.errors[0]
                });
            }
            return sourceColumn.addCard(card, sourceIndex, true);
        },

        _addDragZone: function () {
            var column;

            column = this.cmp;
            this._dragZone = Ext.create('Ext.dd.DragZone', this.getDndContainer(), {
                ddGroup: column.ddGroup,

                onBeforeDrag: function (data, e) {
                    var avatar;

                    avatar = Ext.fly(this.dragElId);
                    avatar.setWidth(data.targetWidth);
                    return column.fireEvent('cardpickedup', data.card);
                },
                proxy: Ext.create('Ext.dd.StatusProxy', {
                    animRepair: true,
                    shadow: false,
                    dropNotAllowed: "cardboard"
                }),

                getDragData: function (e) {
                    var avatar, dragEl, sourceEl;

                    dragEl = e.getTarget('.drag-handle', 10);
                    if (dragEl) {
                        sourceEl = e.getTarget('.rui-card', 10) || e.getTarget('.rui-card-slim', 10);
                        avatar = sourceEl.cloneNode(true);
                        avatar.id = Ext.id();
                        return {
                            targetWidth: Ext.fly(sourceEl).getWidth(),
                            ddel: avatar,
                            sourceEl: sourceEl,
                            repairXY: Ext.fly(sourceEl).getXY(),
                            card: Ext.ComponentManager.get(sourceEl.id),
                            column: column
                        };
                    }
                },

                getRepairXY: function () {
                    return this.dragData.repairXY;
                }
            });
        },

        destroy: function () {
            if (this._dragZone) {
                this._dragZone.destroy();
                if (this._dragZone.proxy) {
                    this._dragZone.proxy.destroy();
                }
            }
            return this.callParent(arguments);
        }
    });

})();
