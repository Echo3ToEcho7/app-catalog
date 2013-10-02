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
            var sourceColumn = dragData.column;
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
            }
            this._addDroppedCard(sourceColumn, card, relativeRecord, relativeRank);
            type = sourceColumn === column ? "reorder" : "move";
            if (column.fireEvent("beforecarddroppedsave", column, card, type) !== false) {
                if (!sourceColumn.planRecord) {
                    return this._moveOutOfBacklog({
                        sourceColumn: sourceColumn,
                        destinationColumn: column,
                        card: card
                    });
                } else if (!column.planRecord) {
                    return this._moveIntoBacklog({
                        sourceColumn: sourceColumn,
                        destinationColumn: column,
                        card: card
                    });
                } else {
                    return this._moveFromColumnToColumn({
                        sourceColumn: sourceColumn,
                        destinationColumn: column,
                        card: card
                    });
                }
            }
        },

        _moveIntoBacklog: function (options) {
            var record,
                _this = this;

            record = options.card.getRecord();
            options.sourceColumn.planRecord.set('features', Ext.Array.filter(options.sourceColumn.planRecord.get('features'), function (obj) {
                return obj.id !== '' + record.getId();
            }));
            return options.sourceColumn.planRecord.save({
                success: function () {
                    return _this._onDropSaveSuccess(options.destinationColumn, options.sourceColumn, options.card, record, "move");
                },
                failure: function (response, opts) {
                    var sourceIndex;

                    sourceIndex = options.sourceColumn.findCardInfo(record) && options.sourceColumn.findCardInfo(record).index;
                    return _this._onDropSaveFailure(options.destinationColumn, options.sourceColumn, record, options.card, sourceIndex, response);
                }
            });
        },

        _moveOutOfBacklog: function (options) {
            var record,
                _this = this;

            record = options.card.getRecord();
            options.destinationColumn.planRecord.get('features').push({
                id: record.getId().toString(),
                ref: record.get('_ref')
            });
            return options.destinationColumn.planRecord.save({
                success: function () {
                    return _this._onDropSaveSuccess(options.destinationColumn, null, options.card, record, "move");
                },
                failure: function (response, opts) {
                    var sourceIndex;

                    sourceIndex = options.sourceColumn.findCardInfo(record) && options.sourceColumn.findCardInfo(record).index;
                    return _this._onDropSaveFailure(options.destinationColumn, options.sourceColumn, record, options.card, sourceIndex, response);
                }
            });
        },

        _moveFromColumnToColumn: function (options) {
            var record,
                _this = this;

            record = options.card.getRecord();
            options.sourceColumn.planRecord.set('features', Ext.Array.filter(options.sourceColumn.planRecord.get('features'), function (obj) {
                return obj.id !== '' + record.getId();
            }));
            options.destinationColumn.planRecord.get('features').push({
                id: record.getId().toString(),
                ref: record.get('_ref')
            });
            return Ext.Ajax.request({
                method: 'POST',
                withCredentials: true,
                url: this._constructUrl(options.sourceColumn.planRecord.getId(), options.destinationColumn.planRecord.getId()),
                jsonData: {
                    data: [
                        {
                            id: record.getId() + '',
                            ref: record.get('_ref')
                        }
                    ]
                },
                success: function () {
                    var type;

                    type = options.sourceColumn === options.column ? "reorder" : "move";
                    return _this._onDropSaveSuccess(options.destinationColumn, options.sourceColumn, options.card, record, type);
                },
                failure: function (response, opts) {
                    var sourceIndex;

                    sourceIndex = options.sourceColumn.findCardInfo(record) && options.sourceColumn.findCardInfo(record).index;
                    return _this._onDropSaveFailure(options.destinationColumn, options.sourceColumn, record, options.card, sourceIndex, response);
                }
            });
        },

        _constructUrl: function (sourceId, destinationId) {
            return Rally.environment.getContext().context.services.planning_service_url + '/api/plan/' + sourceId + '/features/to/' + destinationId;
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
