const names = [
  'Juan',
  'Pedro',
  'Maria',
  'Jose',
  'Luis',
  'Ana',
  'Carlos',
  'Jorge',
  'Alberto',
  'Raul',
  'Rosa',
  'Sofia',
  'Laura',
  'Fernando'
]

const lastNames = [
  'Garcia',
  'Rodriguez',
  'Martinez',
  'Lopez',
  'Sanchez',
  'Perez',
  'Gonzalez',
  'Gomez',
  'Fernandez',
  'Diaz',
  'Alvarez',
  'Moreno',
  'Muñoz',
  'Romero'
]
interface MockUser {
  name: string
  lastName: string
  username: string
}

export function generateMockUsers(amount: number): MockUser[] {
  const users: MockUser[] = []

  while (users.length < amount) {
    const name = names[Math.floor(Math.random() * names.length)]
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]
    const username = `${name.toLowerCase()}${lastName.toLowerCase()}${Math.floor(
      Math.random() * 100
    )}`

    if (users.find(user => user.username === username) == null) {
      users.push({
        name,
        lastName,
        username
      })
    }
  }

  return users
}
