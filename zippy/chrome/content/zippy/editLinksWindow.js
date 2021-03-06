"use strict";
Zotero.ZippyEditLinksWindow = {

	/**
	 * Generate all the data required for the linked fields configuration dialog
	 * (the ids and names of the fields, as well as whether they're already synced or not)
	 * and opens the dialog.
	 */
	openConfigLinkFields: function() {
		var itemFields = [];
		var linkTree = document.getElementById("linkTree");
		var selection = linkTree.view.getItemAtIndex(linkTree.currentIndex);
		var srcItem = Zotero.Items.get(selection.firstChild.firstChild.getAttribute("srcId"));
		var linkItemId = selection.firstChild.lastChild.getAttribute("linkId");

		if (selection) {
			// get all fields of item, their ids, and if they are already synced

			var itemTypeFields = Zotero.ItemFields.getItemTypeFields(srcItem.itemTypeID);

			var syncedFields = Zotero.ZippyZotero.DB.query("SELECT data FROM links WHERE id='" + srcItem.id + "' AND link='" + linkItemId + "';");
			if (syncedFields[0].data) {
				var parsedFields = JSON.parse(syncedFields[0].data);
			}
			for (var i = 0; i < itemTypeFields.length; i++) {
				var synced = false;
				if (syncedFields[0].data) {
					synced = parsedFields.indexOf(itemTypeFields[i].toString())  > -1 ? true : false;
				}
				if  (parsedFields) {
					itemFields.push({fieldId: itemTypeFields[i],
						fieldName: Zotero.ItemFields.getName(itemTypeFields[i]),
						isSynced: synced});
				} else {
					itemFields.push({fieldId: itemTypeFields[i],
						fieldName: Zotero.ItemFields.getName(itemTypeFields[i]),
						isSynced: true});
				}
			}

			if (parsedFields) {
				// creators don't belong to an item's type fields, so we do this instead
				var creatorsSynced = parsedFields.indexOf("-1") > -1 ? true : false;
			} else {
				var creatorsSynced = true;
			}
			itemFields.push({fieldId: -1, fieldName: "creators", isSynced: creatorsSynced});
			window.openDialog("chrome://zippy/content/editLinkFields.xul", "editLinkFields", "chrome",
				itemFields, srcItem.id, linkItemId);
		}
	},

	/**
	 * If an item is selected in this window, prompts the user to delete the
	 * link between items (and actually deletes it).
	 */
	deleteLink: function() {
		var linkTree = document.getElementById("linkTree");
		var selection = linkTree.view.getItemAtIndex(linkTree.currentIndex);

		if (selection) {
			var prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
                        .getService(Components.interfaces.nsIPromptService);

			var result = prompts.confirm(null, "Delete Item Link", "Are you sure you want to delete this item link?");
			if (result) {
				Zotero.ZippyZotero.DB.query("DELETE FROM links WHERE id='" +
					selection.firstChild.firstChild.getAttribute("srcId") + "' AND link='" +
					selection.firstChild.lastChild.getAttribute("linkId") + "';");

				selection.remove();
			}
		}
	},

	selectItem: function() {
		var searchTerm = document.getElementById("select-item-title").value;
		var treeCells = document.getElementsByTagName("treecell");
		var rowIndex = -1;
		var linkTree = document.getElementById("linkTree");
		if (treeCells[0].getAttribute("label") === searchTerm) {
			linkTree.treeBoxObject.view.selection.select(0);
			return;
		}
		for (var i = 0; i < treeCells.length; i++) {
			if (treeCells[i].getAttribute("label") === searchTerm) {
				rowIndex++;
				break;
			}
			if (treeCells[i].getAttribute("srcId")) {
				console.log("le");
				rowIndex++;
			}
		}

		console.log(linkTree);
		console.log(rowIndex);
		if (rowIndex) {
			linkTree.treeBoxObject.view.selection.select(rowIndex);
		}
	}
}