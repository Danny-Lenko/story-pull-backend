import { Injectable } from '@nestjs/common';
import { ClientProxy, Transport, ClientProxyFactory } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { CreateContentDto } from './src/modules/content/dto/create-content.dto';

@Injectable()
export class ContentTestClient {
  private client: ClientProxy;

  constructor() {
    this.client = ClientProxyFactory.create({
      transport: Transport.TCP,
      options: {
        host: '0.0.0.0',
        port: 4002, // Assuming content service runs on port 4002
      },
    });
  }

  async onInit() {
    await this.client.connect();
  }

  async createContent(createContentDto: CreateContentDto) {
    return firstValueFrom(this.client.send({ cmd: 'createContent' }, createContentDto));
  }
}

async function runContentTests() {
  const testClient = new ContentTestClient();
  await testClient.onInit();

  async function testCase(name: string, fn: () => Promise<void>) {
    try {
      console.log(`Running test case: ${name}`);
      await fn();
      console.log(`Test case passed: ${name}\n`);
    } catch (error) {
      console.error(`Test case failed: ${name}`);
      console.error('Error:', error, '\n');
    }
  }

  await testCase('Valid content creation', async () => {
    const result = await testClient.createContent({
      title: 'Test Content',
      body: 'This is a test content body.',
      type: 'article',
      author: 'Test Author',
      tags: ['test', 'content'],
    });
    console.log('Content creation result:', result);
    if (!result.id) throw new Error('Content creation did not return an ID');
  });

  await testCase('Missing required field', async () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    await testClient.createContent({
      title: 'Test Content',
      // body is missing
      type: 'article',
      author: 'Test Author',
    });
  });

  await testCase('Invalid content type', async () => {
    await testClient.createContent({
      title: 'Test Content',
      body: 'This is a test content body.',
      type: 'invalid_type',
      author: 'Test Author',
    });
  });

  await testCase('Invalid tag format', async () => {
    await testClient.createContent({
      title: 'Test Content',
      body: 'This is a test content body.',
      type: 'article',
      author: 'Test Author',
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      tags: 'not an array',
    });
  });

  await testCase('Extremely long title', async () => {
    await testClient.createContent({
      title: 'A'.repeat(1000), // Assuming there's a max length for title
      body: 'This is a test content body.',
      type: 'article',
      author: 'Test Author',
    });
  });

  // This test case simulates a database error. You'll need to modify your service to throw an error in certain conditions to test this.
  // await testCase('Simulated database error', async () => {
  //   await testClient.createContent({
  //     title: 'Trigger Database Error',
  //     body: 'This content should trigger a simulated database error.',
  //     type: 'article',
  //     author: 'Test Author',
  //   });
  // });
}

runContentTests();
