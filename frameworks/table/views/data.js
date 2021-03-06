sc_require('views/table_row');

// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================
/*globals SC Endash */

/**
  @class

  DataView handles the display of tableRow views.
  It extends CollectionFastPath to provide accelerated rendering.

  @extends SC.View
  @author Christopher Swasey
*/

/*globals Endash */

Endash.DataView = SC.ListView.extend(Endash.CollectionFastPath, {
  /**
    TableRow
    @property {SC.View}
  */
  exampleView: SC.TableRowView,
  
  hasDragHover: NO,
  
  columnsDidChange: function() {
    this.widthsDidChange(null, '[]', 0, YES);
  }.observes('*columns.[]'),
  
  didReload: function() {
    if(!this.get('content')) return;
    
    var isFirstFullReload = (!this._didFullReload);
    this._didFullReload = YES;
    
    // Invoke only on the the initial full reload
    if(isFirstFullReload) {
      this.columnsDidChange();
    }
  },
  
  widthsDidChange: function(object, key, value, force) {
    if(!this._didFullReload) return;
    
    var columns = this.get('columns');
    if(!columns) return;
    var width = columns.get('@sum(width)'),
      nowShowing = this.get('nowShowing'),
      view, idx;
    
    if(width == this._width && !force) return;
    this._width = width;

    if(key == '[]') {
      idx = 0;
    } else {
      idx = columns.indexOf(object);
    }
    
    nowShowing.forEach(function(idx2) {
      view = this.itemViewForContentIndex(idx2);
      view.widthDidChangeForIndex(idx);
    }, this);
    
    this.set('totalWidth', width);
    this.adjust('minWidth', width);
    this.set('calculatedWidth', width);
  },

  /**
    @private
    We handle repositioning the view specifically to avoid the overhead
    of using set layout or adjust
  */
  _repositionView: function(layer, layout, view) {
    if(SC.platform.supportsAcceleratedLayers) {
      var transform = 'translate3d(0px, ' + layout.top + 'px,0)';
      if (layer) {
        layer.style.webkitTransform = transform;
        layer.style.webkitTransformOrigin = "top left";
        layer.style.top = '';
      }
    } else {
      layer.style.top = layout.top + 'px';
    }
  },
  
  /**
    @private
    Sends a view to a DOM pool.
  */
  sendToDOMPool: function(view) {
    var pool = this.domPoolForExampleView(view.createdFromExampleView);
    pool.push(view);
    var f = view.get("frame");
    
    this._repositionView(view.get('layer'), {top: -(f.height + 2)}, view);
    
    view.set("layerId", SC.guidFor(view));
    if (view.sleepInDOMPool) view.sleepInDOMPool();
  },
  
  /**
    @private
    This should completely reset the view, but we don't use it right now.
  */
  _reset: function() {
    this.reloadIfNeeded(SC.IndexSet.create(), true);
    delete this._viewMap;
    delete this._indexMap;
    var pools = this._domPools || (this._domPools = {});
    for (var p in pools) {
      for(var i = 0, len = pools[p].length; i < len; i++) {
        pools[p][i].destroy();
      }
      pools[p].length = 0;
    }
    
    this.reloadIfNeeded(null, true);
  },
  
  configureItemView: function(itemView, attrs) {
    itemView.beginPropertyChanges();
    itemView.setIfChanged('content', attrs.content);
    itemView.setIfChanged('contentIndex', attrs.contentIndex);
    itemView.setIfChanged('parentView', attrs.parentView);
    itemView.setIfChanged('layerId', attrs.layerId);
    itemView.setIfChanged('isEnabled', attrs.isEnabled);
    itemView.setIfChanged('isSelected', attrs.isSelected);
    itemView.setIfChanged('outlineLevel', attrs.outlineLevel);
    itemView.setIfChanged('disclosureState', attrs.disclosureState);
    itemView.setIfChanged('isVisibleInWindow', attrs.isVisibleInWindow);
    itemView.setIfChanged('isGroupView', attrs.isGroupView);
    itemView.setIfChanged('page', this.page);
    itemView.endPropertyChanges();
    
    this._repositionView(itemView.get('layer'), attrs.layout, itemView);
    itemView._updateCells();
    itemView.widthDidChangeForIndex(0);
  },

  layoutChildViews: function() {
    // This is already handled internally
    this.reloadIfNeeded(null, true);
  },


  /**
    Implements the SC.DropTarget protocol.  
    Called when drag enters droppable area.
  */
  dragEntered: function(drag, evt) {
    if (this.get('isDropTarget')) {
     this.set('hasDragHover', YES);
    }
  }, 

  /**
    Implements the SC.DropTarget protocol.  
    Called when drag exits droppable area.
  */
  dragExited: function(drag, evt) {
    sc_super();

    if (this.get('isDropTarget')) {
      this.set('hasDragHover', NO);
    }
  } 

});
