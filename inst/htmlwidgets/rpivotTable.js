HTMLWidgets.widget({
    name: 'rpivotTable',
    type: 'output',
    initialize: function(el, width, height) {
	    return {};
    },
    resize: function(el, width, height, instance) { },
    renderValue: function(el, x, instance) {
	    x.data = HTMLWidgets.dataframeToD3(x.data);
      if (typeof x.params.sorters != "undefined") {
        if (typeof x.params.sorters[0] == "string") {
            x.params.sorters = eval("("+x.params.sorters[0]+")")
          }
      }
      if (typeof x.params.onRefresh != "undefined") {
        x.params.onRefresh = x.params.onRefresh[0];
      }
      var locale = $.pivotUtilities.locales[x.locale];
      locale.renderers = $.extend({}, locale.renderers,
        locale.d3_renderers || $.pivotUtilities.d3_renderers,
        locale.c3_renderers || $.pivotUtilities.c3_renderers);
      // if subtotals then override renderers to add subtotals
      if(x.subtotals) {
        x.params.renderers = $.extend(
          $.pivotUtilities.subtotal_renderers,
          $.pivotUtilities.d3_renderers,
          $.pivotUtilities.c3_renderers
        );
        x.params.dataClass = $.pivotUtilities.SubtotalPivotData;
      }

      // Start of edits
      // var weightCol = x.weightCol
      var weightCol = null;
      if (x.data.length > 0) {
		  console.log(x.data[0]);
          if ("WPFINWGT" in x.data[0]) {
            weightCol = "WPFINWGT";
          } else if ("Final person weight" in x.data[0]) {
            weightCol = "Final person weight";
          }
      }
      var weightedSum = function() {
        return function(data, rowKey, colKey) {
          var total = 0;
          return {
            push: function(record) {
              if (weightCol) {
                var val = parseFloat(record[weightCol]);
              }
              if (!isNaN(val)) {
                return total += val;
              }
            }
          },
          value: function() { return total; },
          format: function() { return x; }
        }
      }
      x.options.aggregators = $.extend(
        {},
        $.pivotUtilities.aggregators,
        {
          "Weighted Sum": weightedSum();
        }
      )
      // End of edits
		
      $('#'+el.id).pivotUI(x.data, x.params, true, x.locale);
    }
});
