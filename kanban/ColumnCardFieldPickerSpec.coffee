Ext = window.Ext4 || window.Ext

describe 'Rally.apps.kanban.ColumnCardFieldPicker', ->

  afterEach ->
    Rally.test.destroyComponentsOfQuery 'kanbancolumncardfieldpicker'

  it 'should render right side action', ->
    @_createColumnCardFieldPicker().then =>
      expect(@_getRightActionHtml()).toBe @picker.rightInitialText

  it 'should render updated text after right side action clicked', ->
    @_createColumnCardFieldPicker().then =>
      @click(css: @_getColumnCardFieldPickerSelector()).then =>
        @once
          condition: => @_getRightActionHtml() == @picker.rightUpdateText
          description: 'wait for right side action text to swap'

  it 'should deslect list item after right side action clicked 2x', ->
    @_createColumnCardFieldPicker().then =>
      @click(css: @_getColumnCardFieldPickerSelector()).then =>
        @once(
          condition: => @_getRightActionHtml() == @picker.rightUpdateText
          description: 'wait for right side action text to swap'
        ).then =>
          @click(css: @_getColumnCardFieldPickerSelector()).then =>
            @once
              condition: => Ext.query(@_getColumnCardFieldPickerSelector()).length is 0
              description: 'wait for deslect of list item'

  it 'should fire rightactionclick when clicking on the right side action element', ->
    rightActionClickStub = @stub()
    @_createColumnCardFieldPicker(
      listeners:
        rightactionclick: rightActionClickStub
    ).then =>
      @click(css: @_getColumnCardFieldPickerSelector()).then =>
        @once
          condition: => rightActionClickStub.calledOnce
          description: 'wait for rightactionclick event'

  it 'should not fire rightactionclick when not clicking the right side action element', ->
    rightActionClickStub = @stub()
    @_createColumnCardFieldPicker(
      listeners:
        rightactionclick: rightActionClickStub
    ).then  =>
      @click(@picker.list.getEl().down('.' + @picker.rowCheckboxCls).dom).then =>
        @once
          condition: => rightActionClickStub.notCalled
          description: 'rightaction should not be called'

  it 'should preserve second items text when multiple items are selected and list is redrawn', ->
    @_createColumnCardFieldPicker({}, 'Name,FormattedID').then =>
      @click(css: @_getColumnCardFieldPickerSelector()).then =>
        @once(
          condition: => @_getRightActionHtml() == @picker.rightUpdateText
          description: 'wait for first item\'s right side action text to swap'
        ).then =>
          @click(@picker.list.getEl().down('.' + @picker.rightCls.replace(' ', '.') + ':last').dom).then =>
            @once(
              condition: => Ext.query(@_getColumnCardFieldPickerSelector())[1].innerHTML is @picker.rightUpdateText
              description: 'wait for second item\'s right side action text to swap').then =>
                @click(css: @_getColumnCardFieldPickerSelector()).then =>
                  @once
                    condition: => @_getRightActionHtml() is @picker.rightUpdateText
                    description: 'check that second item\'s text is preserved'


  helpers
    _createColumnCardFieldPicker: (config, values) ->
      @picker = Ext.create 'Rally.apps.kanban.ColumnCardFieldPicker', Ext.apply(
        renderTo: 'testDiv'
        modelTypes: ['Defect']
        alwaysExpanded: false
        rightInitialText: 'chocolate'
        rightUpdateText: 'vanilla'
      , config)

      @picker.expand()
      @picker.setValue(values || "Name")
      @waitForComponentReady @picker

    _getColumnCardFieldPickerSelector: () ->
      '.' + @picker.rightCls.replace(' ', '.')

    _getRightActionHtml: () ->
      @picker.list.getEl().down(@_getColumnCardFieldPickerSelector()).getHTML()

