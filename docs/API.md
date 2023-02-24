# API syntax models

## Client -> Server
### Login
```json
{
	"email": "example@test.com"
}
```

### Logout
```json
{
	"token": "13456asdf"
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

### Match start
```json
{
	"matchid": "123456asdf"
}
```


## Server -> Client
### New Messages
```json
{
	"messages": [{"mid": "message"}, {"mid": "message"}]
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
