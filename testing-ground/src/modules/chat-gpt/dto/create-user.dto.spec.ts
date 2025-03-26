import { validate } from 'class-validator';
import { CreateUserDto } from './create-user.dto';

describe('CreateUserDto', () => {
  it('should pass validation with correct data', async () => {
    const dto = new CreateUserDto();
    dto.name = 'John';
    dto.age = 34;

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should not pass validation if name is not a string', async () => {
    const dto = new CreateUserDto();
    dto.name = null;
    dto.age = 34;

    const errors = await validate(dto);

    expect(errors.length).toBe(1);
    expect(errors[0].property).toBe('name');
    expect(errors[0].constraints).toHaveProperty('isString');
  });

  it('should not pass validation if name too short', async () => {
    const dto = new CreateUserDto();
    dto.name = 'OG';
    dto.age = 34;

    const errors = await validate(dto);
    expect(errors.length).toBe(1);
    expect(errors[0].property).toBe('name');
    expect(errors[0].constraints).toHaveProperty('minLength');
  });

  it('should not pass validation if age is not an integer', async () => {
    const dto = new CreateUserDto();
    dto.name = 'John';
    dto.age = 3.4;

    const errors = await validate(dto);
    expect(errors.length).toBe(1);
    expect(errors[0].property).toBe('age');
    expect(errors[0].constraints).toHaveProperty('isInt');
  });

  it('should not pass validation if age is less than 18', async () => {
    const dto = new CreateUserDto();
    dto.name = 'John';
    dto.age = 17;

    const errors = await validate(dto);
    expect(errors.length).toBe(1);
    expect(errors[0].property).toBe('age');
    expect(errors[0].constraints).toHaveProperty('min');
  });

  it('should not pass validation and throw 2 errors if name & age are invalid', async () => {
    const dto = new CreateUserDto();
    dto.name = null;
    dto.age = 17;

    const errors = await validate(dto);
    expect(errors.length).toBe(2);
    const properties = errors.map((e) => e.property);
    expect(properties[0]).toBe('name');
    expect(properties[1]).toBe('age');
  });
});
