(function() {
    var Ext = window.Ext4 || window.Ext;

    Ext.define('Rally.apps.blockedwork.BlockedWorkView', {
        extend: 'Ext.view.View',
        alias: 'widget.rallyblockedworkview',
        requires: [
            'Rally.nav.DetailLink',
            'Rally.util.User'
        ],

        mixins: {
            userToolTip: 'Rally.ui.view.UserToolTip',
            showMore: 'Rally.ui.view.ShowMore'
        },

        showMoreCount: 10,
        profileImageSize: 50,
        itemSelector : 'ul:first > li.list-item',

        constructor: function(config) {
            config = Ext.apply({
                tpl: new Ext.XTemplate(
                    '<tpl if="values.length &gt; 0">',
                    '   <ul class="list">',
                    '</tpl>',
                    '<tpl for=".">',
                    '   <li class="list-item {liCls}">',
                    '       <div class="artifact-detail">',
                    '           {detailLink}',
                    '           <span class="name">{artifactName}</span>',
                    '       </div>',
                    '       <div class="list-item-info">',
                    '           <div class="list-item-user">',
                    '               <img src="{image_URL}" style="width: {profileImageSize}px; height: {profileImageSize}px;" class="profile"/>',
                    '           </div>',
                    '           <div class="list-item-details">',
                    '               <div class="status">',
                    '                   <a class="profileLink" href="#"><span class="{userCls}">{userName}</span></a> {blockedTime}',
                    '               </div>',
                    '               <div class="detail-text">',
                    '                   {blockedReason}',
                    '               </div>',
                    '           </div>',
                    '       </div>',
                    '    </li>',
                    '</tpl>',
                    '<tpl if="values.length &gt; 0">',
                    '   </ul><span class="clear" />',
                    '</tpl>'
                )
            }, config);

            this.callParent([config]);
        },

        initComponent: function() {
            this.addEvents(
                /**
                 * @event
                 * Fires when the component is fully initialized
                 * @param {Rally.ui.discussion.InlineDiscussionReplyEditor} this
                 */
                'ready'
            );

            if(!this.store) {
                this.store = this._createStore();
            }

            this.callParent(arguments);

            this.on('refresh', this._onRefresh, this);

            this.store.on('load', function() {
                this.fireEvent('ready', this);
                if (Rally.BrowserTest) {
                    Rally.BrowserTest.publishComponentReady(this);
                }
            }, this);
        },

        _createStore: function() {
            return Ext.create('Rally.data.WsapiDataStore', Ext.apply({
                limit: this.showMoreCount,
                pageSize: this.showMoreCount,
                autoLoad: true,
                requester: this,
                model: 'Blocker',
                fetch: ['WorkProduct','Project','Name','FormattedID','CreationDate','BlockedBy','BlockedReason','Disabled','ObjectID'],
                sorters: {
                    property: 'CreationDate',
                    direction: 'DESC'
                }
            }, this.storeConfig));
        },

        prepareData: function(data, recordIndex, record) {
            var artifact = record.data.WorkProduct,
                user = record.data.BlockedBy;

            data.profileImageSize = this.profileImageSize;
            data.liCls = record.index === 0 ? 'first' : '';
            data.artifactName = artifact.Name;
            data.detailLink = Rally.nav.DetailLink.getLink({
                record: artifact,
                text: artifact.FormattedID
            });
            data.blockedTime = record.data._CreatedAt;
            data.userName = user._refObjectName;
            data.user_URL = Rally.nav.Manager.getDetailUrl(user._ref);
            data.image_URL = Rally.util.User.getProfileImageUrl(this.profileImageSize, user._ref);
            data.blockedReason = artifact.BlockedReason !== null ? artifact.BlockedReason : "&nbsp;";
            data.userCls = user.Disabled ? 'inactive' : '';

            return data;
        },

        _onRefresh: function() {
            this.buildUserTooltips('BlockedBy');
            this.addShowMoreLink(this.showMoreCount);
        }
    });
})();