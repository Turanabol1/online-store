import { randomUUID } from 'node:crypto';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import type { CreateMaterialDto } from './dto/create-material.dto.js';
import type { UpdateMaterialDto } from './dto/update-material.dto.js';
import { Material, UNITS_OF_MEASURE } from './entities/material.entity.js';

@Injectable()
export class MaterialsService {
  private items: Material[] = [
    {
      id: '1',
      title: 'Цемент М500',
      price: 9,
      unitOfMeasure: 'kg',
      weightPerUnitKg: 1,
      isHeavyCargo: false,
    },
    {
      id: '2',
      title: 'Пісок річковий',
      price: 650,
      unitOfMeasure: 'm3',
      weightPerUnitKg: 1600,
      isHeavyCargo: true,
    },
    {
      id: '3',
      title: 'Гіпсокартон 12.5 мм',
      price: 150,
      unitOfMeasure: 'm2',
      weightPerUnitKg: 8.5,
      isHeavyCargo: false,
    },
  ];

  findAll(search?: string, limit?: string): Material[] {
    let result = this.items;

    if (search) {
      const query = search.toLowerCase();
      result = result.filter((item) => item.title.toLowerCase().includes(query));
    }

    if (limit !== undefined) {
      const count = Number(limit);
      if (!Number.isInteger(count) || count < 1) {
        throw new BadRequestException('Параметр limit має бути додатним цілим числом');
      }
      result = result.slice(0, count);
    }

    return result;
  }

  findOne(id: string): Material {
    const item = this.items.find((material) => material.id === id);
    if (!item) {
      throw new NotFoundException(`Сутність з ID ${id} не знайдена`);
    }
    return item;
  }

  create(dto: CreateMaterialDto): Material {
    this.validate(dto, true);
    const item: Material = {
      id: randomUUID(),
      title: dto.title.trim(),
      price: dto.price,
      unitOfMeasure: dto.unitOfMeasure,
      weightPerUnitKg: dto.weightPerUnitKg,
      isHeavyCargo: dto.isHeavyCargo,
    };
    this.items.push(item);
    return item;
  }

  update(id: string, dto: UpdateMaterialDto): Material {
    const item = this.findOne(id);
    this.validate(dto, false);

    // оновлюємо лише передані поля, id не чіпаємо
    if (dto.title !== undefined) item.title = dto.title.trim();
    if (dto.price !== undefined) item.price = dto.price;
    if (dto.unitOfMeasure !== undefined) item.unitOfMeasure = dto.unitOfMeasure;
    if (dto.weightPerUnitKg !== undefined) item.weightPerUnitKg = dto.weightPerUnitKg;
    if (dto.isHeavyCargo !== undefined) item.isHeavyCargo = dto.isHeavyCargo;
    return item;
  }

  remove(id: string): void {
    const index = this.items.findIndex((material) => material.id === id);
    if (index === -1) {
      throw new NotFoundException(`Сутність з ID ${id} не знайдена`);
    }
    this.items.splice(index, 1);
  }

  // Тіло запиту приходить як довільний JSON, тому типи перевіряємо вручну
  private validate(dto: UpdateMaterialDto, requireAll: boolean): void {
    if (typeof dto !== 'object' || dto === null) {
      throw new BadRequestException('Тіло запиту має бути JSON-об’єктом');
    }
    const errors: string[] = [];
    const check = (name: keyof CreateMaterialDto, ok: (value: unknown) => boolean, hint: string) => {
      const value: unknown = dto[name];
      if (value === undefined) {
        if (requireAll) errors.push(`Поле ${name} є обов’язковим`);
      } else if (!ok(value)) {
        errors.push(`Поле ${name}: ${hint}`);
      }
    };

    check('title', (v) => typeof v === 'string' && v.trim() !== '', 'потрібен непорожній рядок');
    check('price', (v) => typeof v === 'number' && v >= 0, 'потрібне число не менше 0');
    check(
      'unitOfMeasure',
      (v) => UNITS_OF_MEASURE.some((unit) => unit === v),
      `допустимі значення: ${UNITS_OF_MEASURE.join(', ')}`,
    );
    check('weightPerUnitKg', (v) => typeof v === 'number' && v >= 0, 'потрібне число не менше 0');
    check('isHeavyCargo', (v) => typeof v === 'boolean', 'потрібне значення true або false');

    if (errors.length > 0) {
      throw new BadRequestException(errors);
    }
  }
}
