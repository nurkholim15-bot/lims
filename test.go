package main; import ("fmt"; "path/filepath"); func main() { matches, _ := filepath.Glob("C:\\Program Files\\PostgreSQL\\*\\bin\\pg_dump.exe"); fmt.Println(matches) }
