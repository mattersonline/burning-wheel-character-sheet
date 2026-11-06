package main

import (
	"log"
	"net/http"
	"os"
	"path/filepath"

	"burning-wheel-character-sheet/api/internal/characters"
	"burning-wheel-character-sheet/api/internal/httpapi"
)

func main() {
	databasePath := os.Getenv("CHARACTER_DATABASE_FILE")
	if databasePath == "" {
		databasePath = filepath.Join("data", "characters.db")
	}
	legacyPath := os.Getenv("CHARACTER_DATA_FILE")
	if legacyPath == "" {
		legacyPath = filepath.Join("data", "characters.json")
	}

	store, err := characters.NewSQLiteStore(databasePath, legacyPath)
	if err != nil {
		log.Fatalf("initialize character store: %v", err)
	}
	defer store.Close()

	port := os.Getenv("PORT")
	if port == "" {
		port = "8081"
	}

	server := &http.Server{
		Addr:              ":" + port,
		Handler:           httpapi.New(store),
		ReadHeaderTimeout: httpapi.ReadHeaderTimeout,
	}
	log.Printf("character API listening on http://localhost:%s", port)
	log.Fatal(server.ListenAndServe())
}
