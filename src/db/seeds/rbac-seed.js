"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validatePermissionsSync = validatePermissionsSync;
exports.seedRBAC = seedRBAC;
var postgres_js_1 = require("drizzle-orm/postgres-js");
var postgres_1 = require("postgres");
var env_mjs_1 = require("../../env.mjs");
var rbac_1 = require("../schema/rbac");
var permissions_1 = require("../../constants/permissions");
/**
 * RBAC Seeding Script
 *
 * This script seeds the database with:
 * 1. All permissions from the permissions catalog
 * 2. Default system roles
 * 3. Role-permission mappings
 */
function seedRBAC() {
    return __awaiter(this, void 0, void 0, function () {
        var client, db, existingPermissions, permissionInserts, existingRoles, existingRoleNames_1, newRoles, roleInserts, allRoles, allPermissions, existingMappings, permissionMap_1, roleMap_1, mappingsToInsert, _loop_1, _i, DEFAULT_ROLES_1, roleConfig, finalRoles, finalPermissions, finalMappings, _loop_2, _a, finalRoles_1, role, error_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    console.log('🚀 Starting RBAC database seeding...');
                    client = (0, postgres_1.default)(env_mjs_1.env.DATABASE_URL);
                    db = (0, postgres_js_1.drizzle)(client);
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 19, 20, 22]);
                    // 1. Seed Permissions
                    console.log('📝 Seeding permissions...');
                    return [4 /*yield*/, db.select().from(rbac_1.permissions)];
                case 2:
                    existingPermissions = _b.sent();
                    if (!(existingPermissions.length === 0)) return [3 /*break*/, 4];
                    permissionInserts = permissions_1.ALL_PERMISSIONS.map(function (permission) { return ({
                        slug: permission.slug,
                        name: permission.name,
                        description: permission.description,
                        category: permission.category,
                        isActive: true,
                    }); });
                    return [4 /*yield*/, db.insert(rbac_1.permissions).values(permissionInserts)];
                case 3:
                    _b.sent();
                    console.log("\u2705 Inserted ".concat(permissionInserts.length, " permissions"));
                    return [3 /*break*/, 5];
                case 4:
                    console.log("\u2139\uFE0F  Found ".concat(existingPermissions.length, " existing permissions, skipping permission seeding"));
                    _b.label = 5;
                case 5:
                    // 2. Seed Roles
                    console.log('👥 Seeding roles...');
                    return [4 /*yield*/, db.select().from(rbac_1.roles)];
                case 6:
                    existingRoles = _b.sent();
                    existingRoleNames_1 = existingRoles.map(function (r) { return r.name; });
                    newRoles = permissions_1.DEFAULT_ROLES.filter(function (role) { return !existingRoleNames_1.includes(role.name); });
                    if (!(newRoles.length > 0)) return [3 /*break*/, 8];
                    roleInserts = newRoles.map(function (role) { return ({
                        name: role.name,
                        description: role.description,
                        isSystemRole: role.isSystemRole,
                        isActive: true,
                    }); });
                    return [4 /*yield*/, db.insert(rbac_1.roles).values(roleInserts)];
                case 7:
                    _b.sent();
                    console.log("\u2705 Inserted ".concat(roleInserts.length, " new roles"));
                    return [3 /*break*/, 9];
                case 8:
                    console.log('ℹ️  All default roles already exist, skipping role seeding');
                    _b.label = 9;
                case 9:
                    // 3. Seed Role-Permission Mappings
                    console.log('🔗 Seeding role-permission mappings...');
                    return [4 /*yield*/, db.select().from(rbac_1.roles)];
                case 10:
                    allRoles = _b.sent();
                    return [4 /*yield*/, db.select().from(rbac_1.permissions)];
                case 11:
                    allPermissions = _b.sent();
                    return [4 /*yield*/, db.select().from(rbac_1.rolePermissions)];
                case 12:
                    existingMappings = _b.sent();
                    permissionMap_1 = new Map();
                    allPermissions.forEach(function (p) { return permissionMap_1.set(p.slug, p.id); });
                    roleMap_1 = new Map();
                    allRoles.forEach(function (r) { return roleMap_1.set(r.name, r.id); });
                    mappingsToInsert = [];
                    _loop_1 = function (roleConfig) {
                        var roleId = roleMap_1.get(roleConfig.name);
                        if (!roleId)
                            return "continue";
                        var _loop_3 = function (permissionSlug) {
                            var permissionId = permissionMap_1.get(permissionSlug);
                            if (!permissionId) {
                                console.warn("\u26A0\uFE0F  Permission not found: ".concat(permissionSlug));
                                return "continue";
                            }
                            // Check if mapping already exists
                            var existingMapping = existingMappings.find(function (m) { return m.roleId === roleId && m.permissionId === permissionId; });
                            if (!existingMapping) {
                                mappingsToInsert.push({
                                    roleId: roleId,
                                    permissionId: permissionId,
                                });
                            }
                        };
                        for (var _c = 0, _d = roleConfig.permissions; _c < _d.length; _c++) {
                            var permissionSlug = _d[_c];
                            _loop_3(permissionSlug);
                        }
                    };
                    for (_i = 0, DEFAULT_ROLES_1 = permissions_1.DEFAULT_ROLES; _i < DEFAULT_ROLES_1.length; _i++) {
                        roleConfig = DEFAULT_ROLES_1[_i];
                        _loop_1(roleConfig);
                    }
                    if (!(mappingsToInsert.length > 0)) return [3 /*break*/, 14];
                    return [4 /*yield*/, db.insert(rbac_1.rolePermissions).values(mappingsToInsert)];
                case 13:
                    _b.sent();
                    console.log("\u2705 Inserted ".concat(mappingsToInsert.length, " role-permission mappings"));
                    return [3 /*break*/, 15];
                case 14:
                    console.log('ℹ️  All role-permission mappings already exist');
                    _b.label = 15;
                case 15:
                    // 4. Validation Summary
                    console.log('\n📊 RBAC Seeding Summary:');
                    return [4 /*yield*/, db.select().from(rbac_1.roles)];
                case 16:
                    finalRoles = _b.sent();
                    return [4 /*yield*/, db.select().from(rbac_1.permissions)];
                case 17:
                    finalPermissions = _b.sent();
                    return [4 /*yield*/, db.select().from(rbac_1.rolePermissions)];
                case 18:
                    finalMappings = _b.sent();
                    console.log("   \u2022 Total Roles: ".concat(finalRoles.length));
                    console.log("   \u2022 Total Permissions: ".concat(finalPermissions.length));
                    console.log("   \u2022 Total Role-Permission Mappings: ".concat(finalMappings.length));
                    _loop_2 = function (role) {
                        var mappingCount = finalMappings.filter(function (m) { return m.roleId === role.id; }).length;
                        console.log("   \u2022 ".concat(role.name, ": ").concat(mappingCount, " permissions"));
                    };
                    // Show role breakdown
                    for (_a = 0, finalRoles_1 = finalRoles; _a < finalRoles_1.length; _a++) {
                        role = finalRoles_1[_a];
                        _loop_2(role);
                    }
                    console.log('\n✅ RBAC seeding completed successfully!');
                    return [3 /*break*/, 22];
                case 19:
                    error_1 = _b.sent();
                    console.error('❌ Error during RBAC seeding:', error_1);
                    throw error_1;
                case 20: return [4 /*yield*/, client.end()];
                case 21:
                    _b.sent();
                    return [7 /*endfinally*/];
                case 22: return [2 /*return*/];
            }
        });
    });
}
// Validation function to check permissions sync
function validatePermissionsSync() {
    return __awaiter(this, void 0, void 0, function () {
        var client, db, dbPermissions, dbSlugs_1, catalogSlugs_1, missing, extra;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('🔍 Validating permissions sync...');
                    client = (0, postgres_1.default)(env_mjs_1.env.DATABASE_URL);
                    db = (0, postgres_js_1.drizzle)(client);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, , 3, 5]);
                    return [4 /*yield*/, db.select().from(rbac_1.permissions)];
                case 2:
                    dbPermissions = _a.sent();
                    dbSlugs_1 = dbPermissions.map(function (p) { return p.slug; }).sort();
                    catalogSlugs_1 = permissions_1.ALL_PERMISSIONS.map(function (p) { return p.slug; }).sort();
                    missing = catalogSlugs_1.filter(function (slug) { return !dbSlugs_1.includes(slug); });
                    extra = dbSlugs_1.filter(function (slug) { return !catalogSlugs_1.includes(slug); });
                    if (missing.length > 0 || extra.length > 0) {
                        console.error('❌ Permissions out of sync!');
                        if (missing.length > 0) {
                            console.error('Missing from database:', missing);
                        }
                        if (extra.length > 0) {
                            console.error('Extra in database:', extra);
                        }
                        process.exit(1);
                    }
                    else {
                        console.log('✅ Permissions are in sync');
                    }
                    return [3 /*break*/, 5];
                case 3: return [4 /*yield*/, client.end()];
                case 4:
                    _a.sent();
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    });
}
// Run seeding if this file is executed directly
if (require.main === module) {
    seedRBAC()
        .then(function () { return process.exit(0); })
        .catch(function (error) {
        console.error(error);
        process.exit(1);
    });
}
