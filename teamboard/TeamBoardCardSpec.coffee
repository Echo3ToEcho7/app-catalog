Ext = window.Ext4 || window.Ext

describe 'Rally.apps.teamboard.TeamBoardCard', ->
  beforeEach ->
    @record = @mom.getRecord 'user'

  afterEach ->
    @card?.destroy()

  it 'should show first name and last name in the header', ->
    @createCard()

    expect(@cardHeader().down('.team-member-name').getHTML()).toBe @record.get('FirstName') + ' ' + @record.get('LastName')

  it 'should show refObjectName in the header when user has no first or last name', ->
    @record.set 'FirstName', ''
    @record.set 'LastName', ''

    @createCard()

    expect(@cardHeader().down('.team-member-name').getHTML()).toBe @record.get('_refObjectName')

  it 'should show role in the header', ->
    @createCard()

    expect(@cardHeader().down('.team-member-role').getHTML()).toBe @record.get('Role')

  it 'should not show None role in the header', ->
    @record.set 'Role', 'None'

    @createCard()

    expect(@cardHeader().down('.team-member-role').getHTML()).toBe ''

  helpers
    cardHeader: ->
      @card.getEl().down('.card-header')

    createCard: ->
      @card = Ext.create 'Rally.apps.teamboard.TeamBoardCard',
        record: @record
        renderTo: 'testDiv'