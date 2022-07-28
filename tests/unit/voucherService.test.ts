import voucherService from "../../src/services/voucherService";
import { faker } from "@faker-js/faker";
import prisma from "../../src/config/database.js";

beforeEach(async () => {
  await prisma.voucher.deleteMany({});
});

describe("voucherService test suite", () => {
  it("given a valid voucher code should return 201", async () => {
    const newVoucher = {
      code: faker.random.alphaNumeric(10),
      discount: +faker.random.numeric(2),
    };
    await voucherService.createVoucher(newVoucher.code, newVoucher.discount);
    const response = await prisma.voucher.findUnique({
      where: { code: newVoucher.code },
    });
    expect(response).toBeDefined();
  });
  it("given a repeated voucher code should return 400", async () => {
    const newVoucher = {
      code: faker.random.alphaNumeric(10),
      discount: +faker.random.numeric(2),
    };
    await voucherService.createVoucher(newVoucher.code, newVoucher.discount);
    const response = await prisma.voucher.findUnique({
      where: { code: newVoucher.code },
    });
    expect(response).toBeDefined();
    const secondTry = await voucherService.createVoucher(
      newVoucher.code,
      newVoucher.discount
    );
    expect(secondTry).toBe(Error);
  });

  it("given a invalid voucher code should return 400", async () => {
    const newVoucher = {
      code: "",
      discount: +faker.random.numeric(2),
    };
    await voucherService.createVoucher(newVoucher.code, newVoucher.discount);
    const response = await prisma.voucher.findUnique({
      where: { code: newVoucher.code },
    });
    expect(response).toBeUndefined();
  });
  it("given a invalid voucher discount should return 400", async () => {
    const newVoucher = {
      code: faker.random.alphaNumeric(10),
      discount: 101,
    };
    await voucherService.createVoucher(newVoucher.code, newVoucher.discount);
    const response = await prisma.voucher.findUnique({
      where: { code: newVoucher.code },
    });
    expect(response).toBeUndefined();
  });
});

describe("applyVoucher test suite", () => {
  it("given a valid voucher code should return 200", async () => {
    const newVoucher = {
      code: faker.random.alphaNumeric(10),
      discount: +faker.random.numeric(2),
    };
    await voucherService.createVoucher(newVoucher.code, newVoucher.discount);
    const response = await voucherService.applyVoucher(
      newVoucher.code,
      +faker.random.numeric(3)
    );
    expect(response.amount).toBeDefined();
    expect(response.discount).toBeDefined();
    expect(response.finalAmount).toBeDefined();
    expect(response.applied).toBeDefined();
  });
  it("given a valid voucher code should be used", async () => {
    const newVoucher = {
      code: faker.random.alphaNumeric(10),
      discount: +faker.random.numeric(2),
    };
    await voucherService.createVoucher(newVoucher.code, newVoucher.discount);
    await voucherService.applyVoucher(
      newVoucher.code,
      +faker.random.numeric(3)
    );
      const response = await prisma.voucher.findUnique({
        where: { code: newVoucher.code },
      });
      expect(response.used).toBe(true);
  });

  it("given a invalid voucher code should return 400", async () => {
    const newVoucher = {
      code: "",
      discount: +faker.random.numeric(2),
    };
    const response = await voucherService.applyVoucher(
      newVoucher.code,
      +faker.random.numeric(3)
    );
    expect(response).toBe(Error);
  });

  it("given a low amount should not apply voucher", async () => {
    const newVoucher = {
      code: faker.random.alphaNumeric(10),
      discount: +faker.random.numeric(2),
    };
    const response = await voucherService.applyVoucher(
      newVoucher.code,
      +faker.random.numeric(2)
    );
    expect(response.amount).toBeDefined();
    expect(response.discount).toBe(0);
    expect(response.finalAmount).toBe(response.amount);
    expect(response.applied).toBe(false);
  });

});
