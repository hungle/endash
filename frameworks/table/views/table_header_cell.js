sc_require('views/thumb');

SC.TableHeaderCellView = SC.View.extend({
  
  layout: {top:0, bottom:1},
  
  classNames: ['sc-table-cell'],

  tagName: 'div',
  
  displayProperties: ['column','title'],

  isSelected: function() {
    this.invokeLater(this.isSelectedDidChange);
  }.observes('sortState'),

  isSelectedDidChange: function() {
    // TODO: This is a hack until we look into why we can't update UI in
    // update method. Currently if css is updated in update method, 
    // the table cell width gets reset to the initial width at startup
    // rather then not changing...
    switch (this.get('sortState')) {
    case 'ASC':
    case 'DESC':
      this.$().toggleClass('sel', YES);
      break;

    default:
      this.$().toggleClass('sel', NO);
      break;
    } 
  },

  column: null,
    
  // TableHeader will pass this along
  thumbView: null,

  sortDescriptor: null,
  sortDescriptorBinding: '.parentView.sortDescriptor',
  
  sortStateBinding: '*column.sortState',

  createChildViews: function() {
    var labelView, thumbView, sortStateView;

    labelView = this.createChildView(this.get('labelView').extend({
      layout: { left: 8, right: 28, centerY: 0, height: this.get('fontHeight') }
    }));
    this.set('labelView', labelView);

    thumbView = this.createChildView(this.get('thumbView'));
    this.set('thumbView', thumbView);

    sortStateView = this.createChildView(this.get('sortStateView'));
    this.set('sortStateView', sortStateView);

    this.set('childViews', [labelView, thumbView, sortStateView]);
  },

  labelView: SC.View.extend({
    displayProperties: ['value'],
    tagName: 'label',
    valueBinding: '.parentView.column.title',
    render: function(context,firstTime){
      context.push(this.get('value'));
    }
  }),

  // We're going to disable this for now

  /** 
    This View renders the arrow indicating sort state
    
    @private 
  */
  sortStateView: SC.View.extend({
    layout:{top: 0, bottom: 0, right:17,width:11},
    sortStateBinding: '.parentView.sortState',
    sortStateDidChange: function(){
      switch (this.get('sortState')){
        case "ASC":
          this.set('classNames',['sc-view sc-sort-state-asc']);
        break;
        case "DESC":
          this.set('classNames',['sc-view sc-sort-state-desc']);
        break;
        default:
        this.set('classNames',['sc-view']);
        break;
      }
      this.displayDidChange();
    }.observes('sortState')
  }),
  
  
  /** @private */
  sortState: function() {
    var key = this.get('sortDescriptor');
    if(!key || this.spacer)
    {
      return;
    }
    
    var descending = NO;
  
    if(SC.typeOf(key) === "array")
    {
      key = key[0];
    }
      
    if (key.indexOf('ASC') > -1) {
         key = key.split('ASC ')[1];
       } else if (key.indexOf('DESC') > -1) {
         key = key.split('DESC ')[1];
         descending = YES;
       }
    if(key === this.get('column').get('key'))
    {
      return descending ? "DESC" : "ASC";
    }
    
    return "none";
  }.property('sortDescriptor').cacheable()

});
