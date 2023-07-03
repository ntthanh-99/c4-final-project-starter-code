import * as React from 'react'
import { Form, Button } from 'semantic-ui-react'
import Auth from '../auth/Auth'
import { getUploadUrl, uploadFile, patchTodo, getTodo } from '../api/todos-api'
import dateFormat from 'dateformat'

enum UploadState {
  NoUpload,
  FetchingPresignedUrl,
  UploadingFile,
}

interface EditTodoProps {
  match: {
    params: {
      todoId: string
    }
  }
  auth: Auth
}

interface EditTodoState {
  name: string
  dueDate: string
  done: boolean
  file: any
  uploadState: UploadState
}

export class EditTodo extends React.PureComponent<
  EditTodoProps,
  EditTodoState
> {
  state: EditTodoState = {
    name: "",
    dueDate: "",
    done: false,
    file: undefined,
    uploadState: UploadState.NoUpload
  }

  handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    this.setState({
      file: files[0]
    })
  }

  handleIptChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const name  = event.target.value
    if (name.length < 3) return

    this.setState({
      name: name
    })
  }

   handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const dueDate  = event.target.value
    this.setState({
      dueDate: dueDate
    })
  }
 
  handleSubmit = async (event: React.SyntheticEvent) => {
    event.preventDefault()

    try {
      if (!this.state.file) {
        alert('File should be selected')
        return
      }

      if (this.state.name.length < 3) {
        alert('Name must be at least 3 characters')
        return
      }

      try{
        let now = new Date().getTime();
        let dueDate = new Date(this.state.dueDate).getTime();
        console.log(dueDate)
        if(dueDate < now){
          alert('DueDate must be greater than current date')
          return
        }
      }catch{
        alert('DueDate must format: yyyy-MM-dd')
        return
      }
      
      this.setUploadState(UploadState.FetchingPresignedUrl)
      const uploadUrl = await getUploadUrl(this.props.auth.getIdToken(), this.props.match.params.todoId, { 
        name: this.state.name,
        dueDate: this.state.dueDate,
        done: this.state.done
      })

      this.setUploadState(UploadState.UploadingFile)
      await uploadFile(uploadUrl, this.state.file)

      alert('File was uploaded!')
    } catch (e) {
      alert('Could not upload a file: ' + (e as Error).message)
    } finally {
      this.setUploadState(UploadState.NoUpload)
    }
  }

  setUploadState(uploadState: UploadState) {
    this.setState({
      uploadState
    })
  }

    async componentDidMount() {
    try {
      const todo = await getTodo(this.props.auth.getIdToken(), this.props.match.params.todoId)
      this.setState({
        name: todo.name,
        dueDate: todo.dueDate,
        done: todo.done
      })
    } catch (e) {
      alert(`Failed to fetch todo: ${(e as Error).message}`)
    }
  }

  render() {
    return (
      <div>
        <h1>Update TODO</h1>

        <Form onSubmit={this.handleSubmit}>
          <Form.Field>
            <label>Name</label>
            <input
              type="text"
              value={this.state.name || ''}
              onChange={this.handleIptChange}
            />
            <label>DueDate</label>
            <input
              type="date"
              value={dateFormat(this.state.dueDate, 'yyyy-mm-dd') || ''}
              onChange={this.handleDateChange}
            />

            <label>File</label>
            <input
              type="file"
              accept="image/*"
              placeholder="Image to upload"
              onChange={this.handleFileChange}
            />
          </Form.Field>

          {this.renderButton()}
        </Form>
      </div>
    )
  }

  renderButton() {

    return (
      <div>
        {this.state.uploadState === UploadState.FetchingPresignedUrl && <p>Uploading image metadata</p>}
        {this.state.uploadState === UploadState.UploadingFile && <p>Uploading file</p>}
        <Button
          loading={this.state.uploadState !== UploadState.NoUpload}
          type="submit"
        >
          Upload
        </Button>
      </div>
    )
  }
}
