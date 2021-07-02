import {MigrationInterface, QueryRunner, TableColumn} from "typeorm";

export class alterStatementTable1625186560813 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn("statements", new TableColumn({
            name: "sender_id",
            type: 'varchar',
            isNullable: true
        }))
        await queryRunner.changeColumn("statements", "type", new TableColumn({
            name: 'type',
            type: 'enum',
            enum: ['deposit', 'withdraw', 'transfer']
          }))
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn("statements", 'sender_id')
        await queryRunner.changeColumn("statements", "type", new TableColumn({
            name: 'type',
            type: 'enum',
            enum: ['deposit', 'withdraw']
          }))
    }

}
