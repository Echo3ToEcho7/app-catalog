Ext = window.Ext4 || window.Ext
describe 'Rally.apps.itemdetail.ItemDetailApp', ->

  beforeEach ->
    @app = Ext.create 'Rally.apps.itemdetail.ItemDetailApp',
      renderTo: 'testDiv'
      context: Ext.create 'Rally.app.Context',
        initialValues: {}

    @redrawStub = @stub @app.detailView, 'redraw'
    @flairStub = @stub Rally.ui.notify.Notifier, 'showStatus'

  afterEach ->
    @app.destroy()

  it 'responds to objectFocus message', ->

    ajaxRequest = @ajax.whenQuerying('userstory').respondWithCount(1)
    Rally.environment.getMessageBus().publish(Rally.Message.objectFocus, ajaxRequest.getRecord(0))

    expect(@redrawStub).toHaveBeenCalledOnce()
    expect(@flairStub).toHaveBeenCalledOnce()

  it 'only responds to objectFocus events for records that have new detail pages', ->

    ajaxRequest = @ajax.whenQuerying('project').respondWithCount(1)
    Rally.environment.getMessageBus().publish(Rally.Message.objectFocus, ajaxRequest.getRecord(0))

    expect(@redrawStub).not.toHaveBeenCalled()
    expect(@flairStub).not.toHaveBeenCalled()