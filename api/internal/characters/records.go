package characters

import (
	"bytes"
	"encoding/json"
	"fmt"
)

// decodeRecordList preserves older free-text fields as one imported record.
func decodeRecordList[T any](data []byte, imported func(string) T) ([]T, error) {
	if bytes.HasPrefix(bytes.TrimSpace(data), []byte(`"`)) {
		var text string
		if err := json.Unmarshal(data, &text); err != nil {
			return nil, err
		}
		if text == "" {
			return []T{}, nil
		}
		return []T{imported(text)}, nil
	}
	var records []T
	if err := json.Unmarshal(data, &records); err != nil {
		return nil, err
	}
	if records == nil {
		records = []T{}
	}
	return records, nil
}

type NamedRecord struct {
	ID          string `json:"id"`
	Name        string `json:"name"`
	Description string `json:"description"`
}

type NamedRecords []NamedRecord

func (records *NamedRecords) UnmarshalJSON(data []byte) error {
	items, err := decodeRecordList(data, func(text string) NamedRecord {
		return NamedRecord{ID: "legacy-traits", Name: "Imported traits", Description: text}
	})
	if err != nil {
		return err
	}
	*records = items
	return nil
}

type RelationshipType string

const (
	RelationshipDirect      RelationshipType = "relationship"
	RelationshipCircles     RelationshipType = "circles"
	RelationshipNamed       RelationshipType = "namedCircles"
	RelationshipEnemy       RelationshipType = "enemyCircles"
	RelationshipReputation  RelationshipType = "reputation"
	RelationshipAffiliation RelationshipType = "affiliation"
)

func (kind *RelationshipType) UnmarshalJSON(data []byte) error {
	var value string
	if err := json.Unmarshal(data, &value); err != nil {
		return err
	}
	switch RelationshipType(value) {
	case "", RelationshipDirect, RelationshipCircles, RelationshipNamed, RelationshipEnemy,
		RelationshipReputation, RelationshipAffiliation:
		*kind = RelationshipType(value)
		return nil
	default:
		return fmt.Errorf("unknown relationship type: %q", value)
	}
}

type Relationship struct {
	ID          string           `json:"id"`
	Name        string           `json:"name"`
	Description string           `json:"description"`
	Type        RelationshipType `json:"type"`
}

type Relationships []Relationship

func (relationships *Relationships) UnmarshalJSON(data []byte) error {
	items, err := decodeRecordList(data, func(text string) Relationship {
		return Relationship{
			ID: "legacy-relationships", Name: "Imported relationships", Description: text, Type: RelationshipDirect,
		}
	})
	if err != nil {
		return err
	}
	*relationships = items
	return nil
}

func normalizeRecordLists(sheetData *SheetData) {
	if sheetData.CharacterTraits == nil {
		sheetData.CharacterTraits = NamedRecords{}
	}
	if sheetData.DieTraits == nil {
		sheetData.DieTraits = NamedRecords{}
	}
	if sheetData.CallOnTraits == nil {
		sheetData.CallOnTraits = NamedRecords{}
	}
	if sheetData.Relationships == nil {
		sheetData.Relationships = Relationships{}
	}
	for index := range sheetData.Relationships {
		if sheetData.Relationships[index].Type == "" {
			sheetData.Relationships[index].Type = RelationshipDirect
		}
	}
}
