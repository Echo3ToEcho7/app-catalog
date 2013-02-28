Ext = window.Ext4 || window.Ext

Ext.require [
  'Rally.apps.kanban.CardAgeTemplate'
], ->
  describe 'Rally.apps.kanban.CardAgeTemplate', ->
    it 'should not render any content if no revision history', ->
      html = @createTemplate().apply({})
      expect(html).toBe ''

    it 'should not render any content if no revisions', ->
      html = @createTemplate().apply RevisionHistory:
        Revisions: []
      expect(html).toBe ''

    it 'should not render any content if the age is less than the threshold', ->
      template = @createTemplate threshold: 5
      html = template.apply RevisionHistory:
        Revisions: [
          Description: 'Original revision', CreationDate: @dateStringFromThePast 2
        ]
      expect(html).toBe ''

    it 'should render the age based on the original revision', ->
      template = @createTemplate threshold: 2
      html = template.apply RevisionHistory:
        Revisions: [
          Description: 'Original revision', CreationDate: @dateStringFromThePast 5
        ]
      expect(html).toBe '<div class="age">5 days</div>'

    it 'should render the age based on add revision', ->
      template = @createTemplate threshold: 2
      html = template.apply RevisionHistory:
        Revisions: [
          Description: 'Original revision', CreationDate: @dateStringFromThePast 10
          Description: 'FOO added', CreationDate: @dateStringFromThePast 5
        ]
      expect(html).toBe '<div class="age">5 days</div>'

    it 'should render the age based on change revision', ->
      template = @createTemplate threshold: 2
      html = template.apply RevisionHistory:
        Revisions: [
          Description: 'Original revision', CreationDate: @dateStringFromThePast 10
          Description: 'FOO changed from something', CreationDate: @dateStringFromThePast 5
        ]
      expect(html).toBe '<div class="age">5 days</div>'

    helpers
      createTemplate: (options) ->
        Ext.create 'Rally.apps.kanban.CardAgeTemplate',
          Ext.apply
            field:
              displayName: 'Foo'
            , options

      dateStringFromThePast: (n) ->
        Rally.util.DateTime.toIsoString Rally.util.DateTime.add(new Date(), 'day', -n)