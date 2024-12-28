import { ValidationArguments, registerDecorator } from 'class-validator';

export function IsDateRangeValid(property: string, message?: string) {
  console.log('PROPERTY', property);

  return (object: object, propertyName: string) => {
    registerDecorator({
      name: 'isDateRangeValid',
      target: object.constructor,
      propertyName: propertyName,
      options: { message: message || `${propertyName} must be earlier than ${property}` },
      constraints: [property],
      validator: {
        validate(value: string, args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const relatedValue = (args.object as any)[relatedPropertyName];
          if (!value || !relatedValue) return true; // Skip validation if one is missing
          console.log('VALUE', value);
          console.log('RELATED VALUE', relatedValue);
          const valueTimestamp = new Date(value).getTime();
          const relatedValueTimestamp = new Date(relatedValue).getTime();

          console.log('VALUE TIMESTAMP', valueTimestamp);
          console.log('RELATED VALUE TIMESTAMP', relatedValueTimestamp);

          return relatedValueTimestamp <= valueTimestamp;
          //  return value <= relatedValue;
        },
      },
    });
  };
}
