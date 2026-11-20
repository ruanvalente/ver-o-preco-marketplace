import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  requireUser: vi.fn(),
  checkConversationParticipation: vi.fn(),
  sendChatMessage: vi.fn(),
  getConversationMessages: vi.fn(),
  markConversationMessagesRead: vi.fn(),
  startOrGetConversation: vi.fn(),
  redirect: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: mocks.redirect,
}));

vi.mock("@/features/auth/services/session.service", () => ({
  requireUser: mocks.requireUser,
}));

vi.mock("../services/chat.service", () => ({
  checkConversationParticipation: mocks.checkConversationParticipation,
  sendChatMessage: mocks.sendChatMessage,
  getConversationMessages: mocks.getConversationMessages,
  markConversationMessagesRead: mocks.markConversationMessagesRead,
  startOrGetConversation: mocks.startOrGetConversation,
}));

import {
  loadOlderChatMessagesAction,
  markChatMessagesReadAction,
  sendChatImageAction,
  sendChatTextAction,
} from "../services/chat.actions";

const conversationId = "11111111-1111-4111-8111-111111111111";
const userId = "22222222-2222-4222-8222-222222222222";
const attachmentPath = `${conversationId}/${userId}/33333333-3333-4333-8333-333333333333.jpg`;
const cursor = {
  createdAt: "2026-11-13T14:00:00.000Z",
  id: "44444444-4444-4444-8444-444444444444",
};
const message = { id: "55555555-5555-4555-8555-555555555555" };
const messagePage = { messages: [], hasMore: false };

const actionCases = [
  {
    name: "sendChatTextAction",
    invoke: () => sendChatTextAction(conversationId, "Olá"),
    service: mocks.sendChatMessage,
    success: { ok: true, data: message },
  },
  {
    name: "sendChatImageAction",
    invoke: () => sendChatImageAction(conversationId, attachmentPath),
    service: mocks.sendChatMessage,
    success: { ok: true, data: message },
  },
  {
    name: "loadOlderChatMessagesAction",
    invoke: () => loadOlderChatMessagesAction(conversationId, cursor),
    service: mocks.getConversationMessages,
    success: { ok: true, data: messagePage },
  },
  {
    name: "markChatMessagesReadAction",
    invoke: () => markChatMessagesReadAction(conversationId),
    service: mocks.markConversationMessagesRead,
    success: { ok: true, data: null },
  },
];

describe("chat actions authorization", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireUser.mockResolvedValue({ id: userId });
    mocks.checkConversationParticipation.mockResolvedValue({ ok: true });
    mocks.sendChatMessage.mockResolvedValue({ ok: true, data: message });
    mocks.getConversationMessages.mockResolvedValue({
      ok: true,
      data: messagePage,
    });
    mocks.markConversationMessagesRead.mockResolvedValue({
      ok: true,
      data: null,
    });
  });

  it.each(actionCases)(
    "$name verifica a participação antes de agir",
    async ({ invoke, service }) => {
      const result = await invoke();

      expect(mocks.checkConversationParticipation).toHaveBeenCalledWith(
        conversationId,
      );
      expect(service).toHaveBeenCalled();
      expect(result.ok).toBe(true);
    },
  );

  it.each(actionCases)(
    "$name bloqueia quem não participa da conversa",
    async ({ invoke, service }) => {
      mocks.checkConversationParticipation.mockResolvedValue({
        ok: false,
        reason: "forbidden",
      });

      await expect(invoke()).resolves.toEqual({
        ok: false,
        error: "Esta conversa não está disponível.",
      });
      expect(service).not.toHaveBeenCalled();
    },
  );

  it.each(actionCases)(
    "$name falha com retry quando a verificação não está disponível",
    async ({ invoke, service }) => {
      mocks.checkConversationParticipation.mockResolvedValue({
        ok: false,
        reason: "unavailable",
      });

      await expect(invoke()).resolves.toEqual({
        ok: false,
        error: "Não foi possível verificar esta conversa. Tente novamente.",
      });
      expect(service).not.toHaveBeenCalled();
    },
  );
});
