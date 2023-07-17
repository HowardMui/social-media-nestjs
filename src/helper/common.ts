export const returnAscOrDescInQueryParams = (asc: string, desc: string) => {
  const tempObject = {};
  if (!asc && !desc) {
    return undefined;
  }

  if (asc) {
    tempObject[asc] = 'asc';
  }
  if (desc) {
    tempObject[desc] = 'desc';
  }

  return tempObject;
};
