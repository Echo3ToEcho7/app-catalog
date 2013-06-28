Ext = window.Ext4 || window.Ext
describe 'Rally.apps.roadmapplanningboard.ThemeToggleButtonView', ->
  beforeEach ->
    @button = Ext.create 'Rally.apps.roadmapplanningboard.ThemeToggleButtonView',
      cls: ['testThemeButton']
      renderTo: Ext.getBody()

  afterEach ->
    @button.destroy()

  it 'should be creatable', ->
    expect(@button).toBeTruthy()

  it 'has a controller', ->
    expect(@button.getController().$className).toEqual('Rally.apps.roadmapplanningboard.ThemeToggleButtonController')
