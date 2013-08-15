(function () {
    var Ext = window.Ext4 || window.Ext;
    Ext.define('Rally.apps.roadmapplanningboard.ThemeToggleButtonController', {
        extend: 'Deft.mvc.ViewController',
        control: {
            view: {
                listeners: {
                    click: {
                        element: 'el',
                        fn: function () {
                            return this.onClick();
                        }
                    }
                }
            }
        },
        clientMetrics: {
            descriptionProperty: 'getClickAction',
            method: 'onClick'
        },
        onClick: function () {
            var button, buttons, themeContainer, themeContainers, _i, _len, _results;

            buttons = Ext.ComponentQuery.query("{hasCls('themeButtonExpand')}");
            if (buttons.length) {
                button = buttons[0];
                if (button.isVisible()) {
                    button.hide();
                }
            }
            themeContainers = Ext.ComponentQuery.query('[cls=theme_container]');
            themeContainer = themeContainers.pop();
            this._toggle(themeContainer.getEl(), button);
            _results = [];
            for (_i = 0, _len = themeContainers.length; _i < _len; _i++) {
                themeContainer = themeContainers[_i];
                _results.push(this._toggle(themeContainer.getEl()));
            }
            return _results;
        },
        _toggle: function (el, button) {
            if (el.isVisible()) {
                return el.slideOut("t", this._getAfterHiddenListener(button));
            } else {
                return el.slideIn("t", this._getAfterShownListener(button));
            }
        },
        _getAfterHiddenListener: function (button) {
            var _this = this;

            return {
                listeners: {
                    scope: this.getView(),
                    afteranimate: function () {
                        button.show(true);
                        return _this._getCardboardComponent().fireEvent('headersizechanged');
                    }
                }
            };
        },
        _getAfterShownListener: function (button) {
            var _this = this;

            return {
                listeners: {
                    scope: this.getView(),
                    afteranimate: function () {
                        return _this._getCardboardComponent().fireEvent('headersizechanged');
                    }
                }
            };
        },
        _getCardboardComponent: function () {
            return Ext.getCmp(this.view.getEl().parent('.cardboard').id);
        },
        getClickAction: function () {
            var themesVisible;

            themesVisible = this.getView().hasCls('themeButtonCollapse');
            return "Themes toggled from [" + themesVisible + "] to [" + (!themesVisible) + "]";
        }
    });

}).call(this);
