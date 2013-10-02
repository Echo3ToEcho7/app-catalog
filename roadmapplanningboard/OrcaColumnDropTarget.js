(function () {
    var Ext = window.Ext4 || window.Ext;
    var DROP_CLASS = "dnd-over";

    Ext.define('Rally.apps.roadmapplanningboard.OrcaColumnDropTarget', {
        extend: 'Ext.dd.DropTarget',
        requires: [],
        ddGroup: "planningBoard",
        dropAllowed: "planningBoard",
        dropNotAllowed: "planningBoard",
        column: undefined,

        constructor: function (dropEl, config) {
            this.mergeConfig(config);
            this.callParent([dropEl, this.config]);
            this.dropIndicator = Ext.getBody().createChild({
                cls: 'rally-drop-indicator',
                style: {
                    height: '2px',
                    display: 'none'
                }
            });
            this.dropIndicator.setVisibilityMode(Ext.dom.AbstractElement.DISPLAY);
            return this.column.on('destroy', this._onColumnDestroy, this);
        },
        
        notifyDrop: function (source, e, data) {
            var allowDrop, card, cardInfo, cards, column, dropHandler, index, position, samePlace;

            column = this.column;
            card = column.getCard(data.card.getRecord());
            cards = column.getCards(true);
            dropHandler = column.dropControllerPlugin;
            allowDrop = dropHandler.mayDrop(card);
            if (data.target && data.target.position) {
                position = data.target.position;
                if (position === 'first') {
                    index = 0;
                    samePlace = false;
                } else {
                    cardInfo = this.column.findCardInfo(data.target.card.record);
                    if (cardInfo && data.target.position === 'before') {
                        index = cardInfo.index;
                    } else if (cardInfo && data.target.position === 'after') {
                        index = cardInfo.index + 1;
                        if (index >= cards.length) {
                            index = undefined;
                        }
                    }
                    samePlace = cards[index - 1] === card || cards[index] === card;
                }
                if (allowDrop && !samePlace) {
                    dropHandler.onCardDropped(data, index);
                }
            }
            this.dropIndicator.setVisible(false);
            this.column.getContentCell().removeCls(DROP_CLASS);
            return allowDrop && !samePlace;
        },
        
        notifyEnter: function (source, e, data) {
            if (data.dndContainer && data.dndContainer !== this.column.dropControllerPlugin.getDndContainer()) {
                data.dndContainer.removeCls(DROP_CLASS);
            }
            data.dndContainer = this.column.dropControllerPlugin.getDndContainer();
            data.dndContainer.addCls(DROP_CLASS);
            this.notifyOver(source, e, data);
            return false;
        },
        
        notifyOut: function (source, e, data) {
            this.column.dropControllerPlugin.getDndContainer().removeCls(DROP_CLASS);
            this.dropIndicator.setVisible(false);
            return false;
        },
        
        notifyOver: function (source, e, data) {
            var cards, column, found, index, last, mouseEventY, records;

            column = this.column;
            cards = column.getCards(true);
            data.target = null;
            if (!column.mayRank() || (!column.enableCrossColumnRanking && data.column !== column)) {
                records = Ext.clone(column.getRecords());
                records.push(data.card.getRecord());
                column._sortRecords(records);
                index = Ext.Array.indexOf(records, data.card.getRecord());
                if (index === 0) {
                    if (cards[0]) {
                        this._addDropIndicatorBefore(cards[0], data);
                    }
                } else {
                    this._addDropIndicatorAfter(cards[index - 1], data);
                }
            } else {
                mouseEventY = e.xy[1];
                found = Ext.Array.some(cards, function (card) {
                    var cardContainerHeight, cardContainerY;

                    cardContainerY = card.getEl().getY();
                    cardContainerHeight = card.getEl().getSize().height;
                    if (this._mouseIsOverCard(card, mouseEventY)) {
                        if (mouseEventY - cardContainerY > cardContainerHeight / 2) {
                            this._addDropIndicatorAfter(card, data);
                        } else {
                            this._addDropIndicatorBefore(card, data);
                        }
                        return true;
                    } else if (this._mouseIsBeforeCard(card, mouseEventY)) {
                        this._addDropIndicatorBefore(card, data);
                        return true;
                    }
                }, this);
                if (!found && cards.length) {
                    last = cards[cards.length - 1];
                    this._addDropIndicatorAfter(last, data);
                }
            }
            if (!data.target) {
                data.target = {
                    position: 'first'
                };
            }
            return false;
        },
        
        _onColumnDestroy: function () {
            this.column.un('destroy', this._onColumnDestroy, this);
            this.dropIndicator.destroy();
            return this.destroy();
        },
        
        _mouseIsOverCard: function (card, mouseEventY) {
            var cardContainerHeight, cardContainerY;

            cardContainerY = card.getEl().getY();
            cardContainerHeight = card.getEl().getSize().height;
            return cardContainerY <= mouseEventY && (cardContainerHeight + cardContainerY) >= mouseEventY;
        },
        
        _mouseIsBeforeCard: function (card, mouseEventY) {
            var cardContainerY;

            cardContainerY = card.getEl().getY();
            return mouseEventY < cardContainerY;
        },
        
        _addDropIndicatorAfter: function (card, data) {
            this.dropIndicator.setVisible(false);
            data.target = {
                card: card,
                position: 'after'
            };
            this.dropIndicator.insertAfter(card.getEl());
            return this.dropIndicator.setVisible(true);
        },
        
        _addDropIndicatorBefore: function (card, data) {
            this.dropIndicator.setVisible(false);
            data.target = {
                card: card,
                position: 'before'
            };
            this.dropIndicator.insertBefore(card.getEl());
            return this.dropIndicator.setVisible(true);
        }
    });

})();
