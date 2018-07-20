/**
 * Plugin class used to enable multisort in grid,remove it from sorting and including it back in sorting if user wants
 */
/**
 * Plugin class used to enable multisort in grid,remove it from sorting and including it back in sorting if user wants
 */
Ext.define('Dorae.ux.plugin.MultiSortPlugin', {
    extend: 'Ext.AbstractPlugin',
    alias: 'plugin.multisort',
    mixins: {
        observable: 'Ext.util.Observable'
    },

    init: function (grid) {
        if (Ext.isEmpty(grid)) {
            return;
        }
        if (!grid.multiColumnSort) {
            grid.multiColumnSort = true;
        }
        headerclick = function () {
            var gridToSort  = this;
            columnNumberMaintainer(gridToSort);
        };

        grid.beforeRender = function(){
            var gridToSort  = this;
            columnNumberMaintainer(gridToSort);
        };

        grid.addListener('headerclick', headerclick);
        var menu = grid.headerCt.getMenu();
        menu.add({
            text: 'Remove from Sort',
            hidden: true,
            handler: function () {
                var clickedColumn = this.up().up();
                var columnSorter = clickedColumn.getView().getStore().getSorters();
                var sortQueryArr = columnSorter.items;
                if (clickedColumn.sortable) {
                    clickedColumn.sortable = false;
                    for (var cnt = 0; cnt < sortQueryArr.length; cnt++) {
                        if (sortQueryArr[cnt].config.property === clickedColumn.dataIndex) {
                            columnSorter.remove(sortQueryArr[cnt]);
                            var brackIndex = clickedColumn.text.lastIndexOf(')');
                            if (brackIndex !== -1) {
                                var textToSet = clickedColumn.text.substring(0, clickedColumn.text.lastIndexOf(')') - 2);//remove number from col
                            }
                            clickedColumn.setText(textToSet);
                            var gridToSort = clickedColumn.getView().up();
                            columnNumberMaintainer(gridToSort);
                        }
                    }
                }
            }
        });
        menu.add({
            text: 'Include in Sort',
            hidden: true,
            handler: function () {
                var clickedColumn = this.up().up();
                clickedColumn.sortable = true;
                clickedColumn.sort('ASC');
                var gridToSort = clickedColumn.getView().up();
                columnNumberMaintainer(gridToSort);
            }
        });
        menu.on({
            beforeshow: function (menu) {
                if (menu.ownerCmp.xtype === "widgetcolumn" && !menu.activeHeader.sortable) {
                    Ext.Array.forEach(menu.items.items, function (itemFound) {
                        if (itemFound.text === "Remove from Sort") {
                            itemFound.hide();
                            var nextItem = itemFound.next();
                            nextItem.hide();
                        }
                    });
                    return;
                }
                if (menu.activeHeader.sortable) {
                    Ext.Array.forEach(menu.items.items, function (itemFound) {
                        if (itemFound.text === "Remove from Sort") {
                            itemFound.show();
                            var nextItem = itemFound.next();
                            nextItem.hide();
                        }
                    });
                } else {
                    Ext.Array.forEach(menu.items.items, function (itemFound) {
                        if (itemFound.text === "Include in Sort") {
                            itemFound.show();
                            var prevItem = itemFound.prev();
                            prevItem.hide();
                        }
                    });
                }
            }
        });
    }

});

var columnNumberMaintainer = function (gridToSort) {
    var sortArr = gridToSort.getStore().getSorters().items.reverse();//items in sort Array
    var columnsArr = gridToSort.getColumns();
    var brackposition,textToset;
    for (var j = 0; j < columnsArr.length; j++) {
        var colDataIndex = columnsArr[j].dataIndex;
        for (var l = 0; l < sortArr.length; l++) {
            var propToCompare = sortArr[l].config.property;
            if (propToCompare === colDataIndex) {
                var count = l;
                brackposition = columnsArr[j].text.lastIndexOf(')');
                if (brackposition !== -1) {
                    var trimLength = columnsArr[j].text.lastIndexOf('(');
                    textToset = columnsArr[j].text.substring(0, trimLength) + '(' + ++count + ')';
                } else {
                    textToset = columnsArr[j].text + '(' + ++count + ')';
                }
                columnsArr[j].setText(textToset);//setting the osrt order number
                break;
            }
            else {
                brackposition = columnsArr[j].text.charAt(columnsArr[j].text.lastIndexOf(')') - 1);
                var removedNumber = parseInt(brackposition);
                if (brackposition !== -1 && brackposition !== null && brackposition !== undefined && !Object.is(removedNumber, NaN)) {
                    textToset = columnsArr[j].text.substring(0, columnsArr[j].text.lastIndexOf(')') - 2);
                    columnsArr[j].setText(textToset);//removing older sort number greater than 3rd
                }
            }
        }
    }
    sortArr.reverse();
};

/*
mention this 
plugins: [{
    ptype: 'multisort'
    }],
	
	and put this in requires Section 'Ext.ux.plugin.MultiSortPlugin'
*/
