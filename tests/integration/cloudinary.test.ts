import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { seedPersona } from "../helpers/factories";
import { setupMockCloudinary } from "../helpers/mock-cloudinary";
import { memberPersona } from "../helpers/personas";
import { createTestCaller } from "../helpers/test-context";
import { createTestDatabase, type TestDbInstance } from "../helpers/test-db";

describe("Cloudinary Upload & Signing Router (Caixa-Cinza)", () => {
	let testDb: TestDbInstance;
	let mockCloudinary: ReturnType<typeof setupMockCloudinary>;

	beforeAll(async () => {
		testDb = await createTestDatabase();
	});

	afterAll(async () => {
		await testDb.close();
	});

	beforeEach(async () => {
		await testDb.reset();
		await seedPersona(testDb.db, memberPersona);
		mockCloudinary = setupMockCloudinary();
	});

	it("deve gerar assinatura e parâmetros válidos para upload direto no cliente", async () => {
		const caller = createTestCaller({
			db: testDb.db,
			persona: "member",
		});

		const result = await caller.cloudinary.getSignature({
			folder: "orcestra-desafios/evidencias",
		});

		expect(result.apiKey).toBe("123456789012345");
		expect(result.cloudName).toBe("test-cloud");
		expect(result.folder).toBe("orcestra-desafios/evidencias");
		expect(result.signature).toBeDefined();
		expect(typeof result.signature).toBe("string");
		expect(result.timestamp).toBeGreaterThan(0);
	});

	it("deve falhar ao solicitar assinatura se as credenciais do Cloudinary estiverem ausentes", async () => {
		delete process.env.CLOUDINARY_CLOUD_NAME;
		delete process.env.CLOUDINARY_API_KEY;
		delete process.env.CLOUDINARY_API_SECRET;
		delete process.env.CLOUDINARY_URL;

		const caller = createTestCaller({
			db: testDb.db,
			persona: "member",
		});

		await expect(
			caller.cloudinary.getSignature({
				folder: "orcestra-desafios",
			})
		).rejects.toThrowError(
			"Credenciais do Cloudinary não configuradas no servidor"
		);
	});

	it("deve executar upload direto via base64 e retornar URLs públicas seguras", async () => {
		const caller = createTestCaller({
			db: testDb.db,
			persona: "member",
		});

		const mockBase64 =
			"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

		const uploadResult = await caller.cloudinary.uploadDirect({
			base64: mockBase64,
			folder: "orcestra-desafios/testes",
		});

		expect(uploadResult.secureUrl).toContain(
			"https://res.cloudinary.com/test-cloud/image/upload/"
		);
		expect(uploadResult.url).toBeDefined();
		expect(uploadResult.publicId).toContain("orcestra-desafios/testes");

		expect(mockCloudinary.uploadSpy).toHaveBeenCalledWith(
			mockBase64,
			expect.objectContaining({
				folder: "orcestra-desafios/testes",
				resource_type: "auto",
			})
		);
	});

	it("deve capturar erro e lançar TRPCError quando a API do Cloudinary falhar no upload", async () => {
		mockCloudinary.uploadSpy.mockRejectedValueOnce(
			new Error("Cloudinary quota exceeded")
		);

		const caller = createTestCaller({
			db: testDb.db,
			persona: "member",
		});

		await expect(
			caller.cloudinary.uploadDirect({
				base64: "data:image/png;base64,invalid",
				folder: "orcestra-desafios",
			})
		).rejects.toThrowError(
			"Erro no upload do Cloudinary: Cloudinary quota exceeded"
		);
	});
});
