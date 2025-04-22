  <ul className="space-y-3">
    {sortedTasks?.map((task) => (
      <li key={task.id}>{task.title}</li>
    ))}
  </ul> 