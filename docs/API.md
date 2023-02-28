# API syntax models

## Client -> Server
### Login request
```json
{
	"username": "string",
	"password": "string"
}
```

### Logout
```json
{
	"token": "string"
}
```

### Send Message
```json
{
	"token": "123456asdf",
	"message": "hello",
	"timestamp": "1999-01-01T00:00:00.000Z"
}
```


## Server -> Client
### Login response
```json
{
	"session token": "string",
	"success": true
}
```

## Backend
### Start Match
```json
{
	"uid": "123456asdf",
	"matchtype": ["ranked", "unranked", "friendly"]
}
```
