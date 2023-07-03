import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'
import { TodosAccess } from '../../helpers/todosAcess'
import { getUserId } from '../utils';
import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import { createAttachmentPresignedUrl } from '../../businessLogic/todos'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId
    const updateTodoRequest: UpdateTodoRequest = JSON.parse(event.body)
    const userId = getUserId(event)
    // TODO: Return a presigned URL to upload a file for a TODO item with the provided id
    try {
      const imgUrl = await createAttachmentPresignedUrl(todoId);

      const todosAccess = new TodosAccess();
      await todosAccess.updateTodoAttachmentUrl(todoId, userId);
      await todosAccess.updateTodoItem(userId, todoId, updateTodoRequest);

      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({
          uploadUrl: imgUrl,
          todoId: todoId, 
          userId: userId,
          updateTodoRequest: updateTodoRequest
        })
      }
    } catch (error) {
      return {
        statusCode: 500,
        body: JSON.stringify({
          message: 'Error: '
        })
      }
    }
  }
)

handler
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )
