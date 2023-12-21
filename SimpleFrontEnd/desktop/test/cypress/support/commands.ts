const sampleUser = {
    "id": "sample-id-1234",
    "details": {
        "id": "sample-id-1234",
        "aud": "authenticated",
        "role": "authenticated",
        "email": "sampleuser@example.com",
        "email_confirmed_at": "2023-01-01T00:00:00.000Z",
        "phone": "",
        "confirmed_at": "2023-01-01T00:00:00.000Z",
        "last_sign_in_at": "2023-01-01T00:00:00.000Z",
        "app_metadata": {
            "provider": "google",
            "providers": ["google"]
        },
        "user_metadata": {
            "avatar_url": "https://example.com/avatar.jpg",
            "email": "sampleuser@example.com",
            "email_verified": true,
            "full_name": "Sample User",
            "iss": "https://accounts.google.com",
            "name": "Sample User",
            "phone_verified": false,
            "picture": "https://example.com/avatar.jpg",
            "provider_id": "sample-provider-id",
            "sub": "sample-sub"
        },
        "identities": [{
            "identity_id": "sample-identity-id",
            "id": "sample-id",
            "user_id": "sample-user-id",
            "identity_data": {
                "avatar_url": "https://example.com/avatar.jpg",
                "email": "sampleuser@example.com",
                "email_verified": true,
                "full_name": "Sample User",
                "iss": "https://accounts.google.com",
                "name": "Sample User",
                "phone_verified": false,
                "picture": "https://example.com/avatar.jpg",
                "provider_id": "sample-provider-id",
                "sub": "sample-sub"
            },
            "provider": "google",
            "last_sign_in_at": "2023-01-01T00:00:00.000Z",
            "created_at": "2023-01-01T00:00:00.000Z",
            "updated_at": "2023-01-01T00:00:00.000Z",
            "email": "sampleuser@example.com"
        }],
        "created_at": "2023-01-01T00:00:00.000Z",
        "updated_at": "2023-01-01T00:00:00.000Z"
    },
    "role": "Dev",
    "permission_level": "VIP",
    "notifications": {}
};


Cypress.Commands.add('login', (user) => {
    localStorage.setItem(
        'user',
        JSON.stringify(sampleUser)
    );

});