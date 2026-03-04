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
      var weightedSum = function(vals) {
        return function(data, rowKey, colKey) {
          var total = 0;
          return {
            push: function(record) {
              if (weightCol) {
                var val = parseFloat(record[weightCol]);
				if (!isNaN(val)) {
                  total += val;
                }
              }
            },
			value: function() { return total; },
            format: $.pivotUtilities.numberFormat({
				digitsAfterDecimal: 2
			})
          }
        }
      }
      /* x.params.aggregators = $.extend(
        {},
        $.pivotUtilities.aggregators,
        {
          "Weighted Sum": weightedSum
        }
      ) */
	  console.log($.pivotUtilities);
	  if ($.pivotUtilities && $.pivotUtilities.aggregators) {
		  x.params.aggregators = {
		  	"Unweighted" : $.pivotUtilties.aggregators["Count"],
		  	"Weighted" : weightedSum,
		  	"Sum" : $.pivotUtilities.aggregators["Sum"],
		  	"Count as Fraction of Columns" : $.pivotUtilities.aggregators["Count as Fraction of Columns"],
		  	"Count as Fraction of Rows" : $.pivotUtilities.aggregators["Count as Fraction of Rows"],
		  	"Count as Fraction of Total" : $.pivotUtilities.aggregators["Count as Fraction of Total"]
	      }
	  }
      // End of edits
		
      $('#'+el.id).pivotUI(x.data, x.params, true, x.locale);
    }
});
