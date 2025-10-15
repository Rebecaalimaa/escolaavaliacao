/*
  Warnings:

  - Added the required column `pontuacaoMaxima` to the `Atividade` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `atividade` ADD COLUMN `pontuacaoMaxima` INTEGER NOT NULL;
