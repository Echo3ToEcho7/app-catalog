Ext = window.Ext4 || window.Ext

describe 'Rally.apps.portfoliokanban.PortfolioKanbanPolicy', ->

  beforeEach ->
    Model = Ext.define Rally.test.generateName(),
      extend: 'Rally.domain.WsapiModel'
      fields: ['Description']

    @stateRecord = Ext.create Model,
      Description: 'state description'

  afterEach ->
    Rally.test.destroyComponentsOfQuery 'rallyportfoliokanbanpolicy'

  it 'should show not applicable if no state record given', ->
    policy = Ext.create 'Rally.apps.portfoliokanban.PortfolioKanbanPolicy',
      renderTo: 'testDiv'

    expect(policy.getEl().down('.policyContent').dom.innerHTML).toBe 'Not Applicable'

  it 'should show Description field from state record', ->
    policy = Ext.create 'Rally.apps.portfoliokanban.PortfolioKanbanPolicy',
      stateRecord: @stateRecord
      renderTo: 'testDiv'

    expect(policy.getEl().down('.policyContent').dom.innerHTML).toBe 'state description'

  it 'should render edit link if user has edit permissions', ->
    @stateRecord.set 'updatable', true
    policy = Ext.create 'Rally.apps.portfoliokanban.PortfolioKanbanPolicy',
      stateRecord: @stateRecord
      renderTo: 'testDiv'

    expect(policy.getEl().down('.editPolicy')).toBeTruthy()

  it 'should not render edit link if user does not have edit permissions', ->
    @stateRecord.set 'updatable', false
    policy = Ext.create 'Rally.apps.portfoliokanban.PortfolioKanbanPolicy',
      stateRecord: @stateRecord
      renderTo: 'testDiv'

    expect(policy.getEl().down('.editPolicy')).toBeFalsy()
