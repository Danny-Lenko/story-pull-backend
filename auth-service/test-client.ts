import { Injectable } from '@nestjs/common';
import { ClientProxy, Transport, ClientProxyFactory, ClientOptions } from '@nestjs/microservices';

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

  async login(email: string, password: string) {
    return this.client.send({ cmd: 'login' }, { email, password }).toPromise();
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
    const loginResult = await testClient.login('test@example.com', 'password123');
    console.log('Login result:', loginResult);

    // Test invalid login
    console.log('Testing invalid login...');
    try {
      await testClient.login('test@example.com', 'wrongpassword');
    } catch (error) {
      console.log('Invalid login error:', error);
    }
  } catch (error) {
    console.error('An error occurred:', error);
  }
}

runTests();
