import { render, screen, fireEvent, waitFor } from "@/__tests__/test-utils";
import { ProjectForm } from "@/components/project-form";
import "@testing-library/jest-dom";

// Mock ResizeObserver
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}
global.ResizeObserver = ResizeObserverMock;

// Mock TextEncoder/TextDecoder
global.TextEncoder = TextEncoder as any;
global.TextDecoder = TextDecoder as any;

// Mock do useRouter
const mockRefresh = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh: mockRefresh,
  }),
}));

// Mock do useToast
const mockToast = jest.fn();
jest.mock("@/components/ui/use-toast", () => ({
  useToast: () => ({
    toast: mockToast,
  }),
}));

// Mock do useTranslation
jest.mock("@/lib/i18n", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        "Name": "Name",
        "Project name": "Project name",
        "Project Color": "Project Color",
        "Color picker": "Color picker",
        "Select color": "Select color",
        "Color value": "Color value",
        "Mark as favorite": "Mark as favorite",
        "Create Project": "Create Project",
        "Update Project": "Update Project",
        "Saving...": "Saving...",
        "Project created": "Project created",
        "Project has been created successfully.": "Project has been created successfully.",
        "Project updated": "Project updated",
        "Project has been updated successfully.": "Project has been updated successfully.",
        "Failed to create project": "Failed to create project",
        "Failed to update project": "Failed to update project",
        "Please try again.": "Please try again.",
        "Project name is required": "Project name is required",
        "Color must be a valid hex code": "Color must be a valid hex code"
      };
      return translations[key] || key;
    },
  }),
}));

describe("ProjectForm Component", () => {
  const mockProject = {
    id: 1,
    name: "Projeto Teste",
    color: "#ff0000",
    is_favorite: false,
    user_id: 1,
    created_at: new Date().toISOString(),
    updated_at: null,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("deve renderizar o formulário corretamente", () => {
    render(<ProjectForm />);

    // Verificar se os campos estão presentes
    const nameInput = screen.getByLabelText("Name");
    expect(nameInput).toBeInTheDocument();
    expect(nameInput).toHaveAttribute("id", "project-name");

    const colorGroup = screen.getByRole("group", { name: /color picker/i });
    expect(colorGroup).toBeInTheDocument();

    const favoriteCheckbox = screen.getByRole("checkbox", {
      name: /mark as favorite/i,
    });
    expect(favoriteCheckbox).toBeInTheDocument();

    const submitButton = screen.getByRole("button", {
      name: /create project/i,
    });
    expect(submitButton).toBeInTheDocument();
  });

  test("deve preencher o formulário com dados do projeto existente", () => {
    render(<ProjectForm project={mockProject} />);

    // Verificar se os campos estão preenchidos com os dados do projeto
    expect(screen.getByLabelText("Name")).toHaveValue("Projeto Teste");
    expect(screen.getByRole("textbox", { name: /color value/i })).toHaveValue(
      "#ff0000",
    );
    expect(
      screen.getByRole("checkbox", { name: "Mark as favorite" }),
    ).not.toBeChecked();
  });

  test("deve mostrar erro quando a API falha ao criar projeto", async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error("API Error"));

    render(<ProjectForm />);

    // Preencher e submeter o formulário
    fireEvent.change(screen.getByPlaceholderText("Project name"), {
      target: { value: "Novo Projeto" },
    });
    fireEvent.click(screen.getByRole("button", { name: /create project/i }));

    await waitFor(() => {
      // Verificar se o toast de erro foi exibido
      expect(mockToast).toHaveBeenCalledWith({
        variant: "destructive",
        title: "Failed to create project",
        description: expect.any(String),
      });
    });
  });

  test("deve validar campos obrigatórios", async () => {
    render(<ProjectForm />);

    // Tentar submeter o formulário sem preencher os campos
    fireEvent.click(screen.getByRole("button", { name: /create project/i }));

    await waitFor(() => {
      // Verificar se a mensagem de erro para o campo nome é exibida
      expect(screen.getByText("Project name is required")).toBeInTheDocument();
    });
  });

  test("deve validar formato da cor", async () => {
    render(<ProjectForm />);

    // Preencher com cor inválida
    fireEvent.change(screen.getByRole("textbox", { name: "Color value" }), {
      target: { value: "invalid-color" },
    });

    // Submeter o formulário
    fireEvent.click(screen.getByRole("button", { name: /create project/i }));

    await waitFor(() => {
      // Verificar se a mensagem de erro para o campo cor é exibida
      expect(
        screen.getByText("Color must be a valid hex code"),
      ).toBeInTheDocument();
    });
  });
});
