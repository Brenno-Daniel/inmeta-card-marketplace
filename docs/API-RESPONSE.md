**URL base:** https://cards-marketplace-api.onrender.com/

⚠️ A API hiberna após inatividade de 30s, por isso, às vezes ela pode demorar alguns minutos para reiniciar depois de um período em inatividade.

- **POST** `/register`
  _Registra um usuário_
  **Request body:**
  ```json
  {
    "name": "Example",
    "email": "example@test.com",
    "password": "123456"
  }
  ```
  **Request response:**
  ```json
  {
    "userId": "random-uuid"
  }
  ```
- **POST** `/login`
  _Realiza o login, retorna um Bearer token para ser usado no header `Authorization`_
  **Request body:**
  ```json
  {
    "email": "example@test.com",
    "password": "123456"
  }
  ```
  **Response body:**
  ```json
  {
    "token": "jwt-token",
    "user": {
      "id": "random-uuid",
      "name": "Example",
      "email": "example@test.com"
    }
  }
  ```
- **GET** `/me`
  _Retorna informações do usuário logado_
  **Response body:**
  ```json
  {
    "id": "random-uuid",
    "name": "Example",
    "email": "example@test.com",
    "cards": [
      {
        "id": "card-uuid",
        "name": "Test",
        "description": "Description test",
        "imageUrl": "https://www.duelshop.com.br/30260-thickbox_default/baronne-de-fleur-ra01-en034-super-rare.jpg",
        "createdAt": "2024-02-15T16:40:14.677Z"
      }
    ]
  }
  ```
- **GET** `/cards`
  _Retorna todas as cartas registradas no sistema_
  **Query:**
  ```json
  {
    "rpp": 10,
    "page": 1
  }
  ```
  **Response body:**
  ```json
  {
    "list": [
      {
        "id": "card-uuid",
        "name": "Test",
        "description": "Description test",
        "imageUrl": "https://www.duelshop.com.br/30260-thickbox_default/baronne-de-fleur-ra01-en034-super-rare.jpg",
        "createdAt": "2024-02-15T16:40:14.677Z"
      }
    ],
    "rpp": 10,
    "page": 1,
    "more": false
  }
  ```
- **GET** `/cards/:id`
  _Retorna uma carta específica_
  **Response body:**
  ```json
  {
    "id": "03038aa7-c893-4393-8d01-05b6fb6e088a",
    "name": "Tornado Dragon",
    "description": "2 Level 4 monsters\nOnce per turn (Quick Effect): You can detach 1 material from this card, then target 1 Spell/Trap on the field; destroy it.",
    "imageUrl": "https://images.ygoprodeck.com/images/cards/6983839.jpg",
    "createdAt": "2025-07-10T19:21:16.853Z"
  }
  ```
- **POST** `/me/cards`
  _Adiciona cartas ao usuário_
  **Request body:**
  ```json
  {
    "cardIds": ["card-uuid"]
  }
  ```
- **GET** `/me/cards`
  _Retorna todas as cartas do usuário logado_
  **Response body:**
  ```json
  [
    {
      "id": "card-uuid",
      "name": "A Shattered, Colorless Realm",
      "description": "If \"Vicious Astraloud\" is on the field: Target 1 card on the field; destroy it, then, if the destroyed card's original name was \"Vicious Astraloud\", you can Special Summon 1 of your banished \"Visas Starfrost\", or if it was not, you can make 1 \"Vicious Astraloud\" you control gain 1500 ATK.",
      "imageUrl": "https://images.ygoprodeck.com/images/cards/44553392.jpg",
      "createdAt": "2024-02-16T12:00:19.173Z"
    }
  ]
  ```
- **POST** `/trades`
  _Cria uma solicitação de troca_
  **Request body:**
  ```json
  {
    "cards": [
      {
        "cardId": "card-uuid",
        "type": "OFFERING"
      },
      {
        "cardId": "new-card-uuid",
        "type": "RECEIVING"
      }
    ]
  }
  ```
  **Response body:**
  ```json
  {
    "tradeId": "trade-uuid"
  }
  ```
- **GET** `/trades`
  _Retorna todas solicitações de troca registradas_
  **Query:**
  ```json
  {
    "rpp": 10,
    "page": 1
  }
  ```
  **Response body:**
  ```json
  {
    "list": [
      {
        "id": "trade-uuid",
        "userId": "random-uuid",
        "createdAt": "2024-02-15T17:15:08.807Z",
        "user": {
          "name": "Example"
        },
        "tradeCards": [
          {
            "id": "trade-card-uuid-1",
            "cardId": "card-uuid",
            "tradeId": "trade-uuid",
            "type": "OFFERING",
            "card": {
              "id": "card-uuid",
              "name": "Test",
              "description": "Description test",
              "imageUrl": "https://www.duelshop.com.br/30260-thickbox_default/baronne-de-fleur-ra01-en034-super-rare.jpg",
              "createdAt": "2024-02-15T16:40:14.677Z"
             }
          },
          {
            "id": "trade-card-uuid-2",
            "cardId": "card-uuid-2",
            "tradeId": "trade-uuid",
            "type": "RECEIVING",
            "card": {
              "id": "card-uuid-2",
              "name": "Card 2",
              "description": "Card 2 description",
              "imageUrl": "https://www.duelshop.com.br/30375-large_default/pot-of-prosperity-ra01-en066-ultra-rare.jpg""createdAt": "2024-02-15T16:43:30.621Z"
            }
          }
        ]
      }
    ],
    "rpp": 10,
    "page": 1,
    "more": false
  }
  ```
- **DELETE** `/trades/:id`
  _Remove uma solicitação de troca_
