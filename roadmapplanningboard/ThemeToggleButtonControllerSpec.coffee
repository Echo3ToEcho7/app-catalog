Ext = window.Ext4 || window.Ext
describe 'Rally.apps.roadmapplanningboard.ThemeToggleButtonController', ->
  beforeEach ->
    @button = Ext.create 'Rally.apps.roadmapplanningboard.ThemeToggleButtonView',
      cls: ['testThemeButton']
      renderTo: Ext.getBody()

    @controller = @button.getController()
  afterEach ->
    @button.destroy()

  it 'should be creatable', ->
    expect(@controller).toBeTruthy()

  it 'should hide things with class "theme_container" on click',  ->
    fakeContainer = Ext.create 'Ext.container.Container',
      renderTo: Ext.getBody()
      cls: 'theme_container'

    expect(fakeContainer.getEl().isVisible()).toBeTruthy()
    @controller.onClick()
    @once(
      condition: ->
        not fakeContainer.getEl().getActiveAnimation()
    ).then =>
      expect(fakeContainer.getEl().isVisible()).toBeFalsy()
      fakeContainer.destroy()

  it 'should show expand button when hide button is clicked', ->
    fakeContainer = Ext.create 'Ext.container.Container',
      renderTo: Ext.getBody()
      cls: 'theme_container'

    themeExpandButton = Ext.create 'Rally.apps.roadmapplanningboard.ThemeToggleButtonView',
      renderTo: Ext.getBody()
      cls: ['themeButton', 'themeButtonExpand']
      hidden: true

    expect(themeExpandButton.getEl().isVisible()).toBeFalsy()

    @controller.onClick()
    @once(
      condition: ->
        not themeExpandButton.getEl().getActiveAnimation() and not fakeContainer.getEl().getActiveAnimation()
    ).then =>
      expect(themeExpandButton.getEl().isVisible()).toBeTruthy()
      fakeContainer.destroy()
      themeExpandButton.destroy()


  it 'getClickAction should return message based on theme visibility', ->
    @button.addCls 'themeButtonCollapse'
    expect(@controller.getClickAction()).toEqual("Themes toggled from [true] to [false]")

    themeExpandButton = Ext.create 'Rally.apps.roadmapplanningboard.ThemeToggleButtonView',
      renderTo: Ext.getBody()
      cls: ['themeButton', 'themeButtonExpand']
    expect(themeExpandButton.getController().getClickAction()).toEqual("Themes toggled from [false] to [true]")

    themeExpandButton.destroy()
