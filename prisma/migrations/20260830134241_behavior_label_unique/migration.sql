/*
  Warnings:

  - A unique constraint covering the columns `[label]` on the table `Behavior` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Behavior_label_key" ON "Behavior"("label");
