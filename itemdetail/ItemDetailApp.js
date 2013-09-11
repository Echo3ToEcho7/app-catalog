(function() {
    var Ext = window.Ext4 || window.Ext;

    /**
     * Item Detail App
     * A detail page inside an app. View details for any artifact.
     */
    Ext.define('Rally.apps.itemdetail.ItemDetailApp', {
        extend: 'Rally.app.App',
        appName: 'Item Detail',

        mixins: {
            messageable: 'Rally.Messageable'
        },

        cls: 'item-detail-app',

        launch: function() {

            this.detailView = Ext.create('Rally.ui.detail.view.panel.PanelDetailView');
            this.add(this.detailView);

            this.subscribe(this, Rally.Message.objectFocus, function(record){

                controllerClass = Rally.ui.detail.controller.DetailController.getControllerClass(record);
                if(!controllerClass){
                    return;
                }

                if (record.getId() == (this.detailView.getRecord() && this.detailView.getRecord().getId())) {
                    return;
                }

                this.showFocusFlair(record);
                this.loadRecord(record);
            }, this);

            this.subscribe(this, Rally.Message.objectUpdate, function(record) {
                if (record.getId() == (this.detailView.getRecord() && this.detailView.getRecord().getId())) {
                    this.loadRecord(record);
                }
            }, this);

            this.subscribe(this, Rally.Message.objectDestroy, function(record) {
                if (record.getId() == (this.detailView.getRecord() && this.detailView.getRecord().getId())) {
                    this.detailView.switchToDeleteView();
                }
            }, this);
        },

        loadRecord: function(record){
            //record not guaranteed to be fully hydrated, need to get the full object.
            record.self.load(record.getId(), {
                success: function(fullRecord){
                    this.detailView.redraw({
                        record: fullRecord,
                        editMode: false
                    });
                },
                scope: this
            });

        },

        showFocusFlair: function(record){
            Rally.ui.notify.Notifier.showStatus({
                message: "Focused on " + record.get('FormattedID') + ': ' + record.get("_refObjectName"),
                duration: 5000
            });
        }
    });
})();
