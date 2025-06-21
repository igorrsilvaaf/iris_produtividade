import { TodoList } from "@/components/todo-list"
import { Todo } from "@/components/Todo"
import { QuickAddTodo } from "@/components/quick-add-todo"
import { getInboxTasks } from "@/lib/todos"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { requireAuth } from "@/lib/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export default async function TodoPage() {
  const session = await requireAuth()
  const userId = Number(session?.user?.id)
  
  const tasks = await getInboxTasks(userId)
  const sampleTask = tasks.length > 0 ? tasks[0] : null

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Gerenciador de Tarefas</h1>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Adicionar Tarefa</CardTitle>
          <CardDescription>Adicione uma nova tarefa rapidamente</CardDescription>
        </CardHeader>
        <CardContent>
          <QuickAddTodo />
        </CardContent>
      </Card>
      
      <Tabs defaultValue="list" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="list">Lista de Tarefas</TabsTrigger>
          <TabsTrigger value="individual">Componente Individual</TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          <Card>
            <CardHeader>
              <CardTitle>Suas Tarefas</CardTitle>
              <CardDescription>Aqui estão todas as suas tarefas pendentes.</CardDescription>
            </CardHeader>
            <CardContent>
              <TodoList tasks={tasks} />
            </CardContent>
            <CardFooter className="flex justify-between pt-6">
              <div className="text-sm text-muted-foreground">
                Total de tarefas: {tasks.length}
              </div>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="individual">
          <Card>
            <CardHeader>
              <CardTitle>Componente de Tarefa Individual</CardTitle>
              <CardDescription>Demonstração do componente Todo melhorado.</CardDescription>
            </CardHeader>
            <CardContent>
              {sampleTask ? (
                <Todo todo={sampleTask} />
              ) : (
                <p>Nenhuma tarefa disponível para demonstração.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 