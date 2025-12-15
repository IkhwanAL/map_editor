package main

import (
	"fmt"
	"log"
	"net/http"

	"github.com/IkhwanAL/mapeditor/ui"
)

func IsMethodCorrect(request *http.Request, method string) bool {
	return request.Method == method
}

func main() {
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		err := ui.MainPage().Render(r.Context(), w)
		if err != nil {
			log.Fatal("Cannot Render Main Page", err.Error())
		}
	})

	http.Handle("/js/", http.StripPrefix("/js/", http.FileServer(http.Dir("web/js"))))
	http.Handle("/css/", http.StripPrefix("/css/", http.FileServer(http.Dir("web/css"))))

	fmt.Println("Listening To 127.0.0.1:8080")
	if err := http.ListenAndServe("127.0.0.1:8080", nil); err != nil && err != http.ErrServerClosed {
		log.Fatal(err)
	}
}
