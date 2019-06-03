import React, { Component } from 'react';
import Amplify, { API } from 'aws-amplify';
import awsConfig from './aws-exports';
import { withAuthenticator } from 'aws-amplify-react';

import './App.css';

Amplify.configure(awsConfig);

let apiName = 'todoAPI';
let path = '/items';

class App extends Component {
  state = {
    title: '',
    content: '',
    list: [],
    showDetail: false,
    selectedItem: {}
  }

  handleChange = (e) => {
    const { value, name } = e.target;
    this.setState({ [name]: value });
  }

  handleSubmit = async (e) => {
    e.preventDefault();

    const body = {
      id: Date.now().toString(),
      title: this.state.title,
      content: this.state.content
    }
    
    try {
      const res = await API.post(apiName, path, { body });
      console.log(res);
    } catch(err) {
      console.log(err)
    }

    this.setState({ title: '', content: '' });
    this.fetchList();
  }

  handleSelectItem = async (id) => {
    this.setState({ showDetail: true, selectedItem: {} });
    
    try {
      const res = await API.get(apiName, `${path + '/object/' + id}`);
      this.setState({ selectedItem: { ...res } });
    } catch (err) {
      console.log(err);
    }
  }

  handleDelete = async (id) => {
    try {
      await API.del(apiName, `${path + '/object/' + id}`);
      this.setState({ showDetail: false });
      this.fetchList();
    } catch (err) {
      console.log(err);
    }
  }

  handleBackList = () => {
    this.setState({ showDetail: false });
  }

  async fetchList() {
    try {
      const res = await API.get(apiName, path);
      this.setState({ list: [...res] });
    } catch (err) {
      console.log(err);
    }
  }
  
  componentDidMount() {
    this.fetchList();
  }
  

  render() {
    const { handleChange, handleSubmit, handleSelectItem, handleBackList, handleDelete } = this;
    const { title, content, list, showDetail, selectedItem } = this.state;

    return (
      <div className="App">
        <h2>Todo</h2>
        <form onSubmit={handleSubmit}>
          <div className="row">
            <label htmlFor="title">Title</label>
            <input 
              id="title"
              type="text" 
              name="title" 
              value={title} 
              onChange={handleChange} 
            />
          </div>
          <div className="row">
            <label htmlFor="content">content</label>
            <textarea 
              id="content"
              name="content" 
              value={content} 
              onChange={handleChange}
            ></textarea>
          </div>
          <button className="btn" type="submit">Submit</button>
        </form>
        <hr/>
        <h3>List</h3>
        <ul style={{ display: showDetail ? 'none' : 'block' }}>
          {list.map(item => (
              <li key={item.id} onClick={() => handleSelectItem(item.id)}>{item.title}</li>
              )
            )
          }
        </ul>
        {
          showDetail && (
            <div className="detail">
              <h4>{selectedItem.title}</h4>
              <p>{selectedItem.content}</p>
              <button type="button" className="btn" onClick={handleBackList}>Back to List</button>
              <button type="button" className="btn" onClick={() => handleDelete(selectedItem.id)}>Delete</button>
            </div>
          )
        }
      </div>
    )
  }
}

export default withAuthenticator(App, true);

