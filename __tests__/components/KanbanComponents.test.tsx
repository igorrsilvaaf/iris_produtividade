import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import * as dndKit from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import * as i18n from '@/lib/i18n';

jest.mock('@dnd-kit/sortable', () => ({
  ...jest.requireActual('@dnd-kit/sortable'),
  useSortable: jest.fn(() => ({
    attributes: {},
    listeners: {},
    setNodeRef: jest.fn(),
    transform: { x: 0, y: 0, scaleX: 1, scaleY: 1 },
    transition: 'transform 0.3s ease',
    isDragging: false
  }))
}));

jest.mock('@/lib/i18n', () => ({
  useTranslation: () => ({
    t: (key: string) => key, // Retorna a própria chave para simplificar o teste
    language: 'pt'
  }),
}));


const SortableCard = ({ card, onDelete, onEdit }) => {
  const { t } = i18n.useTranslation();
  const { attributes, listeners, setNodeRef, transform, transition } = dndKit.useSortable({
    id: card.id,
    data: { type: 'card', card },
  });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  
  const handleCardClick = (e) => {
    if ((e.target).closest('button')) {
      return;
    }
    onEdit(card.id);
  };
  
  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className="card-test-class" 
      data-card-id={card.id} 
      data-type="card" 
      data-column={card.column}
      onClick={handleCardClick}
      {...attributes} 
    >
      <div className="card-title">{card.title}</div>
      {card.description && (
        <div className="card-description">
          {card.description.length > 50 
            ? `${card.description.substring(0, 50)}...`
            : card.description}
        </div>
      )}
      <div className="card-actions">
        <button 
          className="edit-button" 
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            onEdit(card.id);
          }}
        >
          {t("edit")}
        </button>
        <button 
          className="delete-button" 
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            onDelete(card.id);
          }}
        >
          {t("delete")}
        </button>
      </div>
    </div>
  );
};

const DroppableColumn = ({ 
  title, 
  columnKey, 
  items, 
  activeColumn, 
  setActiveColumn, 
  newCardTitle, 
  setNewCardTitle, 
  createNewCard,
  onDeleteCard,
  onEditCard,
}) => {
  const { t } = i18n.useTranslation();
  const { setNodeRef } = dndKit.useSortable({
    id: `column-${columnKey}`,
    data: { type: 'column', column: columnKey }
  });
  
  const getEmptyMessage = () => {
    switch(columnKey) {
      case "backlog": return t("No tasks in backlog");
      case "planning": return t("No tasks in planning");
      case "inProgress": return t("No tasks in progress");
      case "validation": return t("No tasks in validation");
      case "completed": return t("No completed tasks");
      default: return t("No tasks");
    }
  };
  
  return (
    <div 
      className="column-test-class" 
      ref={setNodeRef} 
      data-type="column" 
      data-column={columnKey}
    >
      <div className="column-header">{title}</div>
      <div className="column-content">
        {items.length === 0 ? (
          <div className="empty-message">{getEmptyMessage()}</div>
        ) : (
          items.map(card => (
            <SortableCard 
              key={card.id} 
              card={card} 
              onDelete={onDeleteCard} 
              onEdit={onEditCard} 
            />
          ))
        )}
      </div>
      
      {activeColumn === columnKey ? (
        <div className="add-task-form">
          <input
            type="text"
            placeholder={t("addTask")}
            value={newCardTitle}
            onChange={(e) => setNewCardTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && newCardTitle.trim()) {
                createNewCard(columnKey);
              }
            }}
            className="add-task-input"
          />
          <button 
            className="submit-button"
            onClick={() => createNewCard(columnKey)}
          >
            {t("addTask")}
          </button>
          <button 
            className="cancel-button"
            onClick={() => setActiveColumn(null)}
          >
            {t("cancel")}
          </button>
        </div>
      ) : (
        <button
          className="add-task-button"
          onClick={() => setActiveColumn(columnKey)}
        >
          {t("addTask")}
        </button>
      )}
    </div>
  );
};

describe('SortableCard', () => {
  const mockCard = {
    id: 1,
    title: 'Tarefa Teste',
    description: 'Descrição da tarefa de teste',
    column: 'backlog',
    kanban_order: 0,
    completed: false
  };
  
  const mockDelete = jest.fn();
  const mockEdit = jest.fn();
  
  afterEach(() => {
    jest.clearAllMocks();
  });
  
  test('renderiza o card com título e descrição', () => {
    render(
      <SortableCard card={mockCard} onDelete={mockDelete} onEdit={mockEdit} />
    );
    
    expect(screen.getByText('Tarefa Teste')).toBeInTheDocument();
    expect(screen.getByText('Descrição da tarefa de teste')).toBeInTheDocument();
  });
  
  test('chama onEdit quando clicado no card', () => {
    render(
      <SortableCard card={mockCard} onDelete={mockDelete} onEdit={mockEdit} />
    );
    
    fireEvent.click(screen.getByText('Tarefa Teste'));
    expect(mockEdit).toHaveBeenCalledWith(1);
  });
  
  test('chama onEdit quando clicado no botão de editar', () => {
    render(
      <SortableCard card={mockCard} onDelete={mockDelete} onEdit={mockEdit} />
    );
    
    fireEvent.click(screen.getByText('edit'));
    expect(mockEdit).toHaveBeenCalledWith(1);
  });
  
  test('chama onDelete quando clicado no botão de excluir', () => {
    render(
      <SortableCard card={mockCard} onDelete={mockDelete} onEdit={mockEdit} />
    );
    
    fireEvent.click(screen.getByText('delete'));
    expect(mockDelete).toHaveBeenCalledWith(1);
  });
});

describe('DroppableColumn', () => {
  const mockCards = [
    {
      id: 1,
      title: 'Tarefa 1',
      description: 'Descrição da tarefa 1',
      column: 'backlog',
      kanban_order: 0,
      completed: false
    },
    {
      id: 2,
      title: 'Tarefa 2',
      description: 'Descrição da tarefa 2',
      column: 'backlog',
      kanban_order: 1,
      completed: false
    }
  ];
  
  const mockProps = {
    title: 'Backlog',
    columnKey: 'backlog',
    items: mockCards,
    activeColumn: null,
    setActiveColumn: jest.fn(),
    newCardTitle: '',
    setNewCardTitle: jest.fn(),
    createNewCard: jest.fn(),
    onDeleteCard: jest.fn(),
    onEditCard: jest.fn(),
  };
  
  afterEach(() => {
    jest.clearAllMocks();
  });
  
  test('renderiza o título da coluna e as tarefas', () => {
    render(<DroppableColumn {...mockProps} />);
    
    expect(screen.getByText('Backlog')).toBeInTheDocument();
    expect(screen.getByText('Tarefa 1')).toBeInTheDocument();
    expect(screen.getByText('Tarefa 2')).toBeInTheDocument();
  });
  
  test('mostra mensagem quando não há tarefas', () => {
    render(
      <DroppableColumn 
        {...mockProps} 
        items={[]} 
      />
    );
    
    expect(screen.getByText('No tasks in backlog')).toBeInTheDocument();
  });
  
  test('mostra formulário de adicionar tarefa quando a coluna está ativa', () => {
    render(
      <DroppableColumn 
        {...mockProps} 
        activeColumn="backlog"
      />
    );
    
    expect(screen.getByPlaceholderText('addTask')).toBeInTheDocument();
    expect(screen.getByText('addTask')).toBeInTheDocument();
    expect(screen.getByText('cancel')).toBeInTheDocument();
  });
  
  test('chama setActiveColumn quando clica no botão de adicionar tarefa', () => {
    render(<DroppableColumn {...mockProps} />);
    
    fireEvent.click(screen.getByText('addTask'));
    expect(mockProps.setActiveColumn).toHaveBeenCalledWith('backlog');
  });
  
  test('chama createNewCard quando pressiona Enter no input', () => {
    render(
      <DroppableColumn 
        {...mockProps} 
        activeColumn="backlog"
        newCardTitle="Nova Tarefa"
      />
    );
    
    fireEvent.keyDown(screen.getByPlaceholderText('addTask'), { key: 'Enter' });
    expect(mockProps.createNewCard).toHaveBeenCalledWith('backlog');
  });
}); 