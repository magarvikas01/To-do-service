import Keycloak from 'keycloak-connect';

const keycloak = new Keycloak({}, {
  clientId: 'todo-client',
  bearerOnly: true,
  serverUrl: 'http://localhost:8080', 
  realm: 'myrealm',
});

export default keycloak;
