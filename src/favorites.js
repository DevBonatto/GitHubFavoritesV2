import { gitHubUser } from './gitHubeUser.js'

class Favorites {
  constructor(root) {
    this.root = document.querySelector(root)
    this.tbody = this.root.querySelector('table tbody')
    this.nonActiveApp = this.root.querySelector('main .nonActiveApp')
    this.load()
    this.loadDocument()
  }

  loadDocument() {
    document.addEventListener('DOMContentLoaded', () => {
      if(localStorage.getItem('activeApp') === 'true') {
        this.nonActiveApp.classList.add('activeApp')
      }else {
        this.nonActiveApp.classList.add('nonActiveApp')
      }
    })
  }

  refreshPage() {
    location.reload()
  }

  load() {
    const storedData = localStorage.getItem('@githut-favorites:')
    this.users = storedData ? JSON.parse(storedData) : []
  }

  save() {
    localStorage.setItem('@githut-favorites:', JSON.stringify(this.users))
  }

  setActiveApp() {
    this.nonActiveApp.classList.add('activeApp')
    localStorage.setItem('activeApp', 'true');
  }

  setNonActiveApp() {
    this.nonActiveApp.classList.add('nonActiveApp')
    localStorage.setItem('activeApp', 'false');
  }

  async add(username) {
    try {
      const userExists = this.users.find(user => user.login.toLowerCase() === username.toLowerCase())
      if(userExists) {
        throw new Error('Usuário já existe')
      }

      const user = await gitHubUser.search(username)
      if(!user.login) {
        throw new Error('Usuário não encontrado')
      }

      this.users = [user, ...this.users]
      this.update()
      this.setActiveApp()
      this.save()
    } catch (error) {
      alert(error.message)
    }
  }

  delete(user) {
    const filteredUsers = this.users.filter(userFiltered => userFiltered.login !== user.login)
    this.users = filteredUsers
    this.update()
    this.save()

    if(this.users.length === 0) {
      this.setNonActiveApp()
      this.refreshPage()
    }
  }
}

export class FavoritesView extends Favorites {
  constructor(root) {
    super(root)
    this.update()
    this.onAdd()
  }

  onAdd() {
    const addButton = this.root.querySelector('.input button')
    const inputField = this.root.querySelector('.input input')

    addButton.onclick = () => {
      const { value } = inputField
      this.add(value)
    }

    inputField.addEventListener('keypress', (event) => this.handleEnterPress(event))
  }

  handleEnterPress(event) {
    const inputField = event.target
    if(event.key === 'Enter') {
      const username = inputField.value
      this.add(username)
      inputField.value = ''
    }
  }

  update() {
    this.removeAllTr()

    this.users.forEach(user => {
      const row = this.createRow()

      row.querySelector('.user img').src = `https://github.com/${user.login}.png`
      row.querySelector('.user a').href = `https://github.com/${user.login}`
      row.querySelector('.user img').alt = `Imagem de ${user.name}`
      row.querySelector('.user p').textContent = user.name
      row.querySelector('.user span').textContent = `/${user.login}`
      row.querySelector('.repositories').textContent = user.public_repos
      row.querySelector('.followers').textContent = user.followers

      row.querySelector('.remove').onclick = () => {
        const isOk = confirm('Tem certeza que deseja deletar esse usuário?')
        if (isOk) {
          this.delete(user)
        }
      }
      this.tbody.append(row)
    })
  }

  createRow() {
    const tr = document.createElement('tr')

    tr.innerHTML = `
      <td class="user">
        <img src="" alt="">
        <a href="" target="_blank">
          <p></p>
          <span></span>
        </a>
      </td>
      <td class="repositories">
        <p></p>
      </td>
      <td class="followers">
        <p></p>
      </td>
      <td>
        <button class="remove">Remover</button>
      </td>
    `
    
    return tr
  }

  removeAllTr() {
    this.tbody.querySelectorAll('tr').forEach(tr => tr.remove())
  }
}