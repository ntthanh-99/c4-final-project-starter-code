import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { TodosAccess } from '../../helpers/todosAcess'
import { getUserId } from '../utils';

// TODO: Get TODO items for a current user
export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    // Write your code here
    const userId = getUserId(event)
    const todoId = event.pathParameters.todoId
    try{
    const todosAccess = new TodosAccess();
    const todo = await todosAccess.getTodoItem(todoId, userId)

    return {
      statusCode: 200,
      body: JSON.stringify({
        item: todo
      })
    }
  } catch (error) {
      return {
        statusCode: 500,
        body: JSON.stringify({
          'Error': error,
        })
      }
    }
  })

handler.use(
  cors({
    credentials: true
  })
)
