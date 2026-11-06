package characters

type InventoryItem struct {
	ID          string `json:"id"`
	Name        string `json:"name"`
	Description string `json:"description"`
	Quantity    int    `json:"quantity"`
}

type Inventory []InventoryItem

// UnmarshalJSON preserves the old free-text inventory as one item's description.
func (inventory *Inventory) UnmarshalJSON(data []byte) error {
	items, err := decodeRecordList(data, func(text string) InventoryItem {
		return InventoryItem{
			ID: "legacy-inventory", Name: "Imported inventory", Description: text, Quantity: 1,
		}
	})
	if err != nil {
		return err
	}
	*inventory = items
	return nil
}

func normalizeInventory(inventory Inventory) Inventory {
	if inventory == nil {
		return Inventory{}
	}
	for index := range inventory {
		if inventory[index].Quantity < 0 {
			inventory[index].Quantity = 0
		}
	}
	return inventory
}
