import { describe, it, expect, beforeEach } from "vitest";
import { useVolunteerStore } from "../stores/volunteerStore";

beforeEach(() => {
  useVolunteerStore.setState({
    tasks: [
      {
        id: "t1",
        title: "Manage Gate A overflow",
        description: "Direct fans to Gate C.",
        priority: "urgent",
        status: "pending",
        zone: "Gate A",
        estimatedMinutes: 15,
        aiGenerated: true,
        createdAt: new Date(),
      },
      {
        id: "t2",
        title: "Open Food Court B kiosk",
        description: "Open kiosk 3 in Food Court B.",
        priority: "high",
        status: "pending",
        zone: "Food Court B",
        estimatedMinutes: 10,
        aiGenerated: true,
        createdAt: new Date(),
      },
      {
        id: "t3",
        title: "Assist fan in wheelchair",
        description: "Mobility assistance at Section 112.",
        priority: "high",
        status: "accepted",
        zone: "Section 112",
        estimatedMinutes: 8,
        aiGenerated: false,
        createdAt: new Date(),
      },
    ],
  });
});

describe("VolunteerStore — Initialization", () => {
  it("should initialize with tasks populated", () => {
    expect(useVolunteerStore.getState().tasks.length).toBeGreaterThan(0);
  });

  it("should have tasks with correct schema fields", () => {
    const task = useVolunteerStore.getState().tasks[0];
    expect(task.id).toBeDefined();
    expect(task.title).toBeDefined();
    expect(task.priority).toMatch(/^(low|medium|high|urgent)$/);
    expect(task.status).toMatch(/^(pending|accepted|in_progress|completed)$/);
    expect(task.aiGenerated).toBeDefined();
  });
});

describe("VolunteerStore — acceptTask", () => {
  it("should change task status from pending to accepted", () => {
    useVolunteerStore.getState().acceptTask("t1");
    const task = useVolunteerStore.getState().tasks.find(t => t.id === "t1");
    expect(task?.status).toBe("accepted");
  });

  it("should not affect other tasks when accepting one", () => {
    useVolunteerStore.getState().acceptTask("t1");
    const task2 = useVolunteerStore.getState().tasks.find(t => t.id === "t2");
    expect(task2?.status).toBe("pending");
  });

  it("should be a no-op for a non-existent task id", () => {
    const before = useVolunteerStore.getState().tasks.map(t => t.status);
    useVolunteerStore.getState().acceptTask("nonexistent-id");
    const after = useVolunteerStore.getState().tasks.map(t => t.status);
    expect(after).toEqual(before);
  });
});

describe("VolunteerStore — completeTask", () => {
  it("should change task status to completed", () => {
    useVolunteerStore.getState().completeTask("t3");
    const task = useVolunteerStore.getState().tasks.find(t => t.id === "t3");
    expect(task?.status).toBe("completed");
  });

  it("should complete a pending task directly", () => {
    useVolunteerStore.getState().completeTask("t2");
    expect(useVolunteerStore.getState().tasks.find(t => t.id === "t2")?.status).toBe("completed");
  });

  it("should not change total task count on complete", () => {
    const before = useVolunteerStore.getState().tasks.length;
    useVolunteerStore.getState().completeTask("t1");
    expect(useVolunteerStore.getState().tasks.length).toBe(before);
  });
});

describe("VolunteerStore — addTask", () => {
  it("should add a new task and prepend it to the front", () => {
    useVolunteerStore.getState().addTask({
      title: "AI-Generated: Gate C overflow",
      description: "Assist overflow from Gate A",
      priority: "urgent",
      zone: "Gate C",
      estimatedMinutes: 12,
      aiGenerated: true,
    });
    const tasks = useVolunteerStore.getState().tasks;
    expect(tasks[0].title).toBe("AI-Generated: Gate C overflow");
    expect(tasks[0].status).toBe("pending");
    expect(tasks[0].id).toMatch(/^t-/);
    expect(tasks[0].createdAt).toBeInstanceOf(Date);
  });

  it("should auto-assign pending status to new tasks", () => {
    useVolunteerStore.getState().addTask({
      title: "Restock restroom supplies",
      description: "Bring supplies to North restroom",
      priority: "medium",
      zone: "Restroom N",
      estimatedMinutes: 8,
      aiGenerated: false,
    });
    expect(useVolunteerStore.getState().tasks[0].status).toBe("pending");
  });

  it("should increase tasks array length by 1", () => {
    const before = useVolunteerStore.getState().tasks.length;
    useVolunteerStore.getState().addTask({
      title: "New Task",
      description: "Description",
      priority: "low",
      zone: "Gate B",
      estimatedMinutes: 5,
      aiGenerated: false,
    });
    expect(useVolunteerStore.getState().tasks.length).toBe(before + 1);
  });

  it("should support AI-generated flag on new tasks", () => {
    useVolunteerStore.getState().addTask({
      title: "Cortex: Deploy barriers",
      description: "Protocol Atlas-3 support",
      priority: "high",
      zone: "Gate C",
      estimatedMinutes: 8,
      aiGenerated: true,
    });
    expect(useVolunteerStore.getState().tasks[0].aiGenerated).toBe(true);
  });
});
