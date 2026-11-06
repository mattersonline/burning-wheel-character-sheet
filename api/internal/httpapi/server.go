package httpapi

import (
	"encoding/json"
	"errors"
	"io"
	"log"
	"net/http"
	"strings"
	"time"

	"burning-wheel-character-sheet/api/internal/characters"
)

const ReadHeaderTimeout = 5 * time.Second

type CharacterStore interface {
	List() ([]characters.Character, error)
	Create(characters.Character) (characters.Character, error)
	Update(string, characters.Character) (characters.Character, error)
	Delete(string) error
}

func New(store CharacterStore) http.Handler {
	mux := http.NewServeMux()
	mux.HandleFunc("GET /healthz", func(w http.ResponseWriter, _ *http.Request) {
		writeJSON(w, http.StatusOK, map[string]string{"status": "ok"})
	})
	mux.HandleFunc("GET /api/characters", func(w http.ResponseWriter, _ *http.Request) {
		characterList, err := store.List()
		if err != nil {
			writeError(w, http.StatusInternalServerError, err.Error())
			return
		}
		writeJSON(w, http.StatusOK, characterList)
	})
	mux.HandleFunc("POST /api/characters", func(w http.ResponseWriter, r *http.Request) {
		var character characters.Character
		if err := decodeJSON(w, r, &character); err != nil {
			writeError(w, http.StatusBadRequest, err.Error())
			return
		}
		created, err := store.Create(character)
		if err != nil {
			writeError(w, http.StatusInternalServerError, err.Error())
			return
		}
		writeJSON(w, http.StatusCreated, created)
	})
	mux.HandleFunc("/api/characters/{id}", func(w http.ResponseWriter, r *http.Request) {
		id := strings.TrimSpace(r.PathValue("id"))
		switch r.Method {
		case http.MethodPut:
			var character characters.Character
			if err := decodeJSON(w, r, &character); err != nil {
				writeError(w, http.StatusBadRequest, err.Error())
				return
			}
			updated, err := store.Update(id, character)
			if errors.Is(err, characters.ErrNotFound) {
				writeError(w, http.StatusNotFound, "character not found")
				return
			}
			if err != nil {
				writeError(w, http.StatusInternalServerError, err.Error())
				return
			}
			writeJSON(w, http.StatusOK, updated)
		case http.MethodDelete:
			if err := store.Delete(id); errors.Is(err, characters.ErrNotFound) {
				writeError(w, http.StatusNotFound, "character not found")
			} else if err != nil {
				writeError(w, http.StatusInternalServerError, err.Error())
			} else {
				writeJSON(w, http.StatusOK, map[string]bool{"deleted": true})
			}
		default:
			w.Header().Set("Allow", "PUT, DELETE")
			writeError(w, http.StatusMethodNotAllowed, "method not allowed")
		}
	})
	return mux
}

func decodeJSON(w http.ResponseWriter, r *http.Request, destination any) error {
	r.Body = http.MaxBytesReader(w, r.Body, 1<<20)
	decoder := json.NewDecoder(r.Body)
	decoder.DisallowUnknownFields()
	if err := decoder.Decode(destination); err != nil {
		return err
	}
	if err := decoder.Decode(&struct{}{}); !errors.Is(err, io.EOF) {
		if err == nil {
			return errors.New("request must contain one JSON value")
		}
		return errors.New("request must contain one JSON value")
	}
	return nil
}

func writeJSON(w http.ResponseWriter, status int, value any) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(status)
	if err := json.NewEncoder(w).Encode(value); err != nil {
		log.Printf("encode response: %v", err)
	}
}

func writeError(w http.ResponseWriter, status int, message string) {
	writeJSON(w, status, map[string]string{"error": message})
}
