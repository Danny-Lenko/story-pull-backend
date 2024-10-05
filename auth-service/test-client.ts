import { Injectable } from '@nestjs/common';
import { ClientProxy, Transport, ClientProxyFactory, ClientOptions } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
class TestClient {
  private client: ClientProxy;

  constructor() {
    const clientOptions: ClientOptions = {
      transport: Transport.TCP,
      options: {
        host: '0.0.0.0',
        port: 4001,
      },
    };

    // Initialize the client using ClientProxyFactory
    this.client = ClientProxyFactory.create(clientOptions);
  }

  async onInit() {
    await this.client.connect();
  }

  async register({ email, password }) {
    return this.client.send({ cmd: 'register' }, { email, password }).toPromise();
  }

  async login({ email, password }) {
    return this.client.send({ cmd: 'login' }, { email, password }).toPromise();
  }

  async validateToken(token: string) {
    return firstValueFrom(this.client.send({ cmd: 'validateToken' }, { token }));
  }
}

// Example of running the tests
async function runTests() {
  const testClient = new TestClient();
  await testClient.onInit();

  try {
    // Test registration
    console.log('Testing registration...');
    const registrationResult = await testClient.register({
      email: 'test@example.com',
      password: 'password123',
    });
    console.log('Registration result:', registrationResult);

    // Test login
    console.log('Testing login...');
    const loginResult = await testClient.login({
      email: 'test@example.com',
      password: 'password123',
    });
    console.log('Login result:', loginResult);

    // Test token validation with valid token
    console.log('Testing token validation with valid token...');
    const validationResult = await testClient.validateToken(loginResult.accessToken);
    console.log('Validation result:', validationResult);

    console.log('Waiting for token to expire (10 seconds)...');
    await new Promise((resolve) => setTimeout(resolve, 10 * 1000 + 1000)); // Wait for 10 and 1 second

    console.log('Testing token validation with expired token...');
    try {
      await testClient.validateToken(loginResult.accessToken);
    } catch (error) {
      console.log('Expired token validation error:', error);
    }
  } catch (error) {
    console.error('An error occurred:', error);
  }
}

runTests();
